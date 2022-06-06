import * as tf from '@tensorflow/tfjs';
import handleArguments from "../utils/handleArguments";
import getTask from './getTask';
import NeuralNetwork from './NeuralNetwork';
import NeuralNetworkData from './NeuralNetworkData';
import NeuralNetworkVis from './NeuralNetworkVis';
import callCallback from '../utils/callcallback';

import nnUtils from './NeuralNetworkUtils';
import { imgToPixelArray, isInstanceOfSupportedElement } from '../utils/imageUtilities';

const DEFAULTS = {
  inputs: [],
  outputs: [],
  dataUrl: null,
  modelUrl: null,
  layers: [],
  task: null,
  debug: false,
  learningRate: 0.2,
  hiddenUnits: 16,
  noTraining: false,
};
class DiyNeuralNetwork {
  constructor(options, callback) {

    this.task = getTask(options.task || 'regression');

    // TODO: can use ?. once file is in TS
    const taskDefaults = this.task.getDefaultOptions ? this.task.getDefaultOptions() : {};

    /**
     * @type {NeuralNetworkOptions}
     */
    this.options = {
      ...DEFAULTS,
      ...taskDefaults,
      ...options,
    };

    this.neuralNetwork = new NeuralNetwork();
    this.neuralNetworkData = new NeuralNetworkData();
    this.neuralNetworkVis = new NeuralNetworkVis();

    this.data = {
      training: [],
    };

    // Methods
    this.init = this.init.bind(this);
    // adding data
    this.addData = this.addData.bind(this);
    this.loadDataInternal = this.loadDataInternal.bind(this);
    // metadata prep
    this.createMetaData = this.createMetaData.bind(this);
    // data prep and handling
    this.prepareForTraining = this.prepareForTraining.bind(this);
    this.normalizeData = this.normalizeData.bind(this);
    this.normalizeInput = this.normalizeInput.bind(this);
    this.searchAndFormat = this.searchAndFormat.bind(this);
    this.formatInputItem = this.formatInputItem.bind(this);
    this.formatInputsForPrediction = this.formatInputsForPrediction.bind(this);
    this.formatInputsForPredictionAll = this.formatInputsForPredictionAll.bind(this);
    this.isOneHotEncodedOrNormalized = this.isOneHotEncodedOrNormalized.bind(this);
    // model prep
    this.train = this.train.bind(this);
    this.trainInternal = this.trainInternal.bind(this);
    this.setLayers = this.setLayers.bind(this);
    this.createNetworkLayers = this.createNetworkLayers.bind(this);
    this.addDefaultLayers = this.addDefaultLayers.bind(this);
    this.compile = this.compile.bind(this);
    // prediction / classification
    this.predict = this.predict.bind(this);
    this.predictMultiple = this.predictMultiple.bind(this);
    this.classify = this.classify.bind(this);
    this.classifyMultiple = this.classifyMultiple.bind(this);
    this.predictInternal = this.predictInternal.bind(this);
    this.classifyInternal = this.classifyInternal.bind(this);
    // save / load data
    this.saveData = this.saveData.bind(this);
    this.loadData = this.loadData.bind(this);
    // save / load model
    this.save = this.save.bind(this);
    this.load = this.load.bind(this);

    // release model
    this.dispose = this.dispose.bind(this);

    // neuroevolution
    this.mutate = this.mutate.bind(this);
    this.crossover = this.crossover.bind(this);

    // Initialize
    this.ready = callCallback(this.init(), callback);
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Initialization
   * ////////////////////////////////////////////////////////////
   */

  /**
   * init - handles the options provided to the constructor for creating layers, loading a model, and loading data.
   * @return {Promise<this>}
   */
  async init() {
    // check if the a static model should be built based on the inputs and output properties
    if (this.options.noTraining === true) {
      this.createLayersNoTraining();
    }

    if (this.options.dataUrl) {
      await this.loadDataInternal();
    }
    if (this.options.modelUrl) {
      // will take a URL to model.json, an object, or files array
      await this.load(this.options.modelUrl);
    }
    return this;
  }

  /**
   * createLayersNoTraining
   */
  createLayersNoTraining() {
    // Create sample data based on options
    const { inputs, outputs } = this.options;
    const data = this.task.getSampleData(inputs, outputs);
    data.forEach(({ xs, ys }) => {
      this.addData(xs, ys);
    });
    this.neuralNetworkData.createMetadata();
    this.addDefaultLayers();
  }

  /**
   * copy
   */
  copy() {
    const nnCopy = new DiyNeuralNetwork(this.options);
    return tf.tidy(() => {
      const weights = this.neuralNetwork.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i += 1) {
        weightCopies[i] = weights[i].clone();
      }
      nnCopy.neuralNetwork.model.setWeights(weightCopies);
      return nnCopy;
    });
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Adding Data
   * ////////////////////////////////////////////////////////////
   */

  /**
   * addData
   * @param {Array | Object} xInputs
   * @param {Array | Object} yInputs
   * @param {*} options
   */
  addData(xInputs, yInputs, options = null) {
    const { inputs, outputs } = this.options;

    // get the input and output labels
    // or infer them from the data
    let inputLabels;
    let outputLabels;

    if (options !== null) {
      // eslint-disable-next-line prefer-destructuring
      inputLabels = options.inputLabels;
      // eslint-disable-next-line prefer-destructuring
      outputLabels = options.outputLabels;
    } else if (inputs.length > 0 && outputs.length > 0) {
      // if the inputs and outputs labels have been defined
      // in the constructor
      if (inputs.every(item => typeof item === 'string')) {
        inputLabels = inputs;
      }
      if (outputs.every(item => typeof item === 'string')) {
        outputLabels = outputs;
      }
    } else if (typeof xInputs === 'object' && typeof yInputs === 'object') {
      inputLabels = Object.keys(xInputs);
      outputLabels = Object.keys(yInputs);
    } else {
      inputLabels = nnUtils.createLabelsFromArrayValues(xInputs, 'input');
      outputLabels = nnUtils.createLabelsFromArrayValues(yInputs, 'output');
    }

    // Make sure that the inputLabels and outputLabels are arrays
    if (!(inputLabels instanceof Array)) {
      throw new Error('inputLabels must be an array');
    }
    if (!(outputLabels instanceof Array)) {
      throw new Error('outputLabels must be an array');
    }

    const formattedInputs = this.searchAndFormat(xInputs);
    const xs = nnUtils.formatDataAsObject(formattedInputs, inputLabels);

    const ys = nnUtils.formatDataAsObject(yInputs, outputLabels);

    this.neuralNetworkData.addData(xs, ys);
  }

  /**
   * @private - called by init() when there is a `dataUrl` in the constructor options.
   * TODO: why does this have different logic from loadData? (Passes input/output labels, creates metadata, prepares for training) - Linda
   */
  async loadDataInternal() {
    const { dataUrl, inputs, outputs } = this.options;

    await this.neuralNetworkData.loadData(dataUrl, inputs, outputs);

    // once the data are loaded, create the metadata
    // and prep the data for training
    // if the inputs are defined as an array of [img_width, img_height, channels]
    this.createMetaData();

    this.prepareForTraining();
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Metadata prep
   * ////////////////////////////////////////////////////////////
   */

  createMetaData() {
    const { inputs } = this.options;

    let inputShape;
    if (Array.isArray(inputs) && inputs.length > 0) {
      inputShape =
        inputs.every(item => typeof item === 'number') && inputs.length > 0 ? inputs : null;
    }

    this.neuralNetworkData.createMetadata(inputShape);
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Data prep and handling
   * ////////////////////////////////////////////////////////////
   */

  /**
   * Prepare data for training by applying oneHot to raw
   */
  prepareForTraining() {
    this.data.training = this.neuralNetworkData.applyOneHotEncodingsToDataRaw();
    this.neuralNetworkData.isWarmedUp = true;
  }

  /**
   * @public
   * @return {void}
   */
  normalizeData() {
    if (!this.neuralNetworkData.isMetadataReady) {
      // if the inputs are defined as an array of [img_width, img_height, channels]
      this.createMetaData();
    }

    if (!this.neuralNetworkData.isWarmedUp) {
      // TODO: it seems like the onehot encoded data is immediately overwritten
      this.prepareForTraining();
    }

    // set the normalized training data
    this.data.training = this.neuralNetworkData.normalizeDataRaw();

    // set isNormalized to true
    this.neuralNetworkData.meta.isNormalized = true;
  }

  /**
   * normalize the input value
   * @param {*} value
   * @param {*} _key
   * @param {*} _meta
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeInput(value, _key, _meta) {
    const key = _key;
    const { min, max } = _meta[key];
    return nnUtils.normalizeValue(value, min, max);
  }

  /**
   * search though the xInputs and format for adding to data.raws
   * @param {*} input
   */
  searchAndFormat(input) {
    let formattedInputs;
    if (Array.isArray(input)) {
      formattedInputs = input.map(item => this.formatInputItem(item));
    } else if (typeof input === 'object') {
      const newXInputs = Object.assign({}, input);
      Object.keys(input).forEach(k => {
        const val = input[k];
        newXInputs[k] = this.formatInputItem(val);
      });
      formattedInputs = newXInputs;
    }
    return formattedInputs;
  }

  /**
   * Returns either the original input or a pixelArray[]
   * @param {*} input
   */
  // eslint-disable-next-line class-methods-use-this
  formatInputItem(input) {
    let imgToPredict;
    let formattedInputs;
    if (isInstanceOfSupportedElement(input)) {
      imgToPredict = input;
    } else if (typeof input === 'object' && isInstanceOfSupportedElement(input.elt)) {
      imgToPredict = input.elt; // Handle p5.js image and video.
    } else if (typeof input === 'object' && isInstanceOfSupportedElement(input.canvas)) {
      imgToPredict = input.canvas; // Handle p5.js image and video.
    }

    if (imgToPredict) {
      formattedInputs = imgToPixelArray(imgToPredict);
    } else {
      formattedInputs = input;
    }

    return formattedInputs;
  }

  /**
   * format the inputs for prediction
   * this means applying onehot or normalization
   * so that the user can use original data units rather
   * than having to normalize
   * @param {*} _input
   * @param {*} meta
   * @param {*} inputHeaders
   */
  formatInputsForPrediction(_input, meta, inputHeaders) {
    let inputData = [];

    // TODO: check to see if it is a nested array
    // to run predict or classify on a batch of data

    if (_input instanceof Array) {
      inputData = inputHeaders.map((prop, idx) => {
        return this.isOneHotEncodedOrNormalized(_input[idx], prop, meta.inputs);
      });
    } else if (_input instanceof Object) {
      // TODO: make sure that the input order is preserved!
      inputData = inputHeaders.map(prop => {
        return this.isOneHotEncodedOrNormalized(_input[prop], prop, meta.inputs);
      });
    }

    // inputData = tf.tensor([inputData.flat()])
    inputData = inputData.flat();

    return inputData;
  }

  /**
   * formatInputsForPredictionAll
   * @param {*} _input
   * @param {*} meta
   * @param {*} inputHeaders
   */
  formatInputsForPredictionAll(_input, meta, inputHeaders) {
    let output;

    if (_input instanceof Array) {
      if (_input.every(item => Array.isArray(item))) {
        output = _input.map(item => {
          return this.formatInputsForPrediction(item, meta, inputHeaders);
        });

        return tf.tensor(output, [_input.length, inputHeaders.length]);
      }
      output = this.formatInputsForPrediction(_input, meta, inputHeaders);
      return tf.tensor([output]);
    }

    output = this.formatInputsForPrediction(_input, meta, inputHeaders);
    return tf.tensor([output]);
  }

  /**
   * check if the input needs to be onehot encoded or
   * normalized
   * @param {*} _input
   * @param {*} _meta
   */
  // eslint-disable-next-line class-methods-use-this
  isOneHotEncodedOrNormalized(_input, _key, _meta) {
    const input = _input;
    const key = _key;

    let output;
    if (typeof _input !== 'number') {
      output = _meta[key].legend[input];
    } else {
      output = _input;
      if (this.neuralNetworkData.meta.isNormalized) {
        output = this.normalizeInput(_input, key, _meta);
      }
    }
    return output;
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Model prep
   * ////////////////////////////////////////////////////////////
   */

  /**
   * train
   * @param {*} optionsOrCallback
   * @param {*} optionsOrWhileTraining
   * @param {*} callback
   * @return {Promise<void>}
   */
  async train(optionsOrCallback, optionsOrWhileTraining, callback) {
    let options;
    let whileTrainingCb;
    let finishedTrainingCb;
    if (
      typeof optionsOrCallback === 'object' &&
      typeof optionsOrWhileTraining === 'function' &&
      typeof callback === 'function'
    ) {
      options = optionsOrCallback;
      whileTrainingCb = optionsOrWhileTraining;
      finishedTrainingCb = callback;
    } else if (
      typeof optionsOrCallback === 'object' &&
      typeof optionsOrWhileTraining === 'function'
    ) {
      options = optionsOrCallback;
      whileTrainingCb = null;
      finishedTrainingCb = optionsOrWhileTraining;
    } else if (
      typeof optionsOrCallback === 'function' &&
      typeof optionsOrWhileTraining === 'function'
    ) {
      options = {};
      whileTrainingCb = optionsOrCallback;
      finishedTrainingCb = optionsOrWhileTraining;
    } else {
      options = {};
      whileTrainingCb = null;
      finishedTrainingCb = optionsOrCallback;
    }

    return callCallback(this.trainInternal(options, whileTrainingCb), finishedTrainingCb);
  }

  /**
   * train
   * @param {*} _options
   * @param {*} whileTrainingCb
   */
  async trainInternal(_options, whileTrainingCb) {
    const options = {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.1,
      whileTraining: null,
      ..._options,
    };

    // if debug mode is true, then use tf vis
    if (this.options.debug === true || this.options.debug === 'true') {
      options.whileTraining = [
        this.neuralNetworkVis.trainingVis(),
        {
          onEpochEnd: whileTrainingCb,
        },
      ];
    } else {
      // if not use the default training
      // options.whileTraining = whileTrainingCb === null ? [{
      //     onEpochEnd: (epoch, loss) => {
      //       console.log(epoch, loss.loss)
      //     }
      //   }] :
      //   [{
      //     onEpochEnd: whileTrainingCb
      //   }];
      options.whileTraining = [
        {
          onEpochEnd: whileTrainingCb,
        },
      ];
    }

    // if metadata needs to be generated about the data
    if (!this.neuralNetworkData.isMetadataReady) {
      // if the inputs are defined as an array of [img_width, img_height, channels]
      this.createMetaData();
    }

    // if the data still need to be summarized, onehotencoded, etc
    if (!this.neuralNetworkData.isWarmedUp) {
      this.prepareForTraining();
    }

    // if inputs and outputs are not specified
    // in the options, then create the tensors
    // from the this.neuralNetworkData.data.raws
    if (!options.inputs && !options.outputs) {
      const { inputs, outputs } = this.neuralNetworkData.convertRawToTensors(this.data.training);
      options.inputs = inputs;
      options.outputs = outputs;
    }

    // check to see if layers are passed into the constructor
    // then use those to create your architecture
    // or use the default layers for the task
    if (!this.neuralNetwork.isLayered) {
      if (this.options.layers && this.options.layers.length > 2) {
        this.createNetworkLayers(this.options.layers);
      } else {
        this.addDefaultLayers();
      }
    }

    if (!this.neuralNetwork.isCompiled) {
      // compile the model with defaults
      this.compile();
    }

    // train once the model is compiled
    await this.neuralNetwork.train(options);
  }

  /**
   * @private
   * @param {LayerJson[]} layers
   */
  setLayers(layers) {
    layers.forEach(layer => {
      this.neuralNetwork.addLayer(tf.layers[layer.type](layer));
    });
  }

  /**
   * @private -- called by train
   * add custom layers from options
   * set the inputShape and output units without mutating the original objects.
   */
  createNetworkLayers(layerJsonArray) {
    const { inputUnits, outputUnits } = this.neuralNetworkData.meta;
    const first = layerJsonArray[0];
    const last = layerJsonArray[layerJsonArray.length - 1];
    const layers = [
      first.inputShape ? first : { ...first, inputShape: inputUnits },
      ...layerJsonArray.slice(1,-1),
      last.units ? last : { ...last, units: outputUnits }
    ];
    this.setLayers(layers);
  }

  /**
   * @private -- called by train and createLayersNoTraining
   * Create and add the standard layers for the current task.
   */
  addDefaultLayers() {
    const { inputUnits, outputUnits } = this.neuralNetworkData.meta;
    const { hiddenUnits } = this.options;
    const layers = this.task.createLayers(inputUnits, hiddenUnits, outputUnits);
    this.setLayers(layers);
  }

  /**
   * @private -- called during training
   * compile the model
   */
  compile() {
    const options = this.task.getCompileOptions(this.options.learningRate);
    this.neuralNetwork.compile(options);

    // if debug mode is true, then show the model summary
    if (this.options.debug) {
      this.neuralNetworkVis.modelSummary(
        {
          name: 'Model Summary',
        },
        this.neuralNetwork.model,
      );
    }
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Prediction / classification
   * ////////////////////////////////////////////////////////////
   */

  /**
   * synchronous predict
   * @param {*} _input
   */
  predictSync(_input) {
    return this.predictSyncInternal(_input);
  }

  /**
   * predict
   * @param {*} _input
   * @param {*} _cb
   */
  predict(_input, _cb) {
    return callCallback(this.predictInternal(_input), _cb);
  }

  /**
   * predictMultiple
   * @param {*} _input
   * @param {*} _cb
   */
  predictMultiple(_input, _cb) {
    return callCallback(this.predictInternal(_input), _cb);
  }

  /**
   * synchronous classify
   * @param {*} _input
   */
  classifySync(_input) {
    return this.classifySyncInternal(_input);
  }

  /**
   * classify
   * @param {*} _input
   * @param {*} _cb
   */
  classify(_input, _cb) {
    return callCallback(this.classifyInternal(_input), _cb);
  }

  /**
   * classifyMultiple
   * @param {*} _input
   * @param {*} _cb
   */
  classifyMultiple(_input, _cb) {
    return callCallback(this.classifyInternal(_input), _cb);
  }

  /**
   * synchronous predict internal
   * @param {*} _input
   * @param {*} _cb
   */
  predictSyncInternal(_input) {
    const { meta } = this.neuralNetworkData;
    const headers = Object.keys(meta.inputs);

    const inputData = this.formatInputsForPredictionAll(_input, meta, headers);

    const unformattedResults = this.neuralNetwork.predictSync(inputData);
    inputData.dispose();

    if (meta !== null) {
      const labels = Object.keys(meta.outputs);

      const formattedResults = unformattedResults.map(unformattedResult => {
        return labels.map((item, idx) => {
          // check to see if the data were normalized
          // if not, then send back the values, otherwise
          // unnormalize then return
          let val;
          let unNormalized;
          if (meta.isNormalized) {
            const { min, max } = meta.outputs[item];
            val = nnUtils.unnormalizeValue(unformattedResult[idx], min, max);
            unNormalized = unformattedResult[idx];
          } else {
            val = unformattedResult[idx];
          }

          const d = {
            [labels[idx]]: val,
            label: item,
            value: val,
          };

          // if unNormalized is not undefined, then
          // add that to the output
          if (unNormalized) {
            d.unNormalizedValue = unNormalized;
          }

          return d;
        });
      });

      // return single array if the length is less than 2,
      // otherwise return array of arrays
      if (formattedResults.length < 2) {
        return formattedResults[0];
      }
      return formattedResults;
    }

    // if no meta exists, then return unformatted results;
    return unformattedResults;
  }

  /**
   * predict
   * @param {*} _input
   * @param {*} _cb
   */
  async predictInternal(_input) {
    const { meta } = this.neuralNetworkData;
    const headers = Object.keys(meta.inputs);

    const inputData = this.formatInputsForPredictionAll(_input, meta, headers);

    const unformattedResults = await this.neuralNetwork.predict(inputData);
    inputData.dispose();

    if (meta !== null) {
      const labels = Object.keys(meta.outputs);

      const formattedResults = unformattedResults.map(unformattedResult => {
        return labels.map((item, idx) => {
          // check to see if the data were normalized
          // if not, then send back the values, otherwise
          // unnormalize then return
          let val;
          let unNormalized;
          if (meta.isNormalized) {
            const { min, max } = meta.outputs[item];
            val = nnUtils.unnormalizeValue(unformattedResult[idx], min, max);
            unNormalized = unformattedResult[idx];
          } else {
            val = unformattedResult[idx];
          }

          const d = {
            [labels[idx]]: val,
            label: item,
            value: val,
          };

          // if unNormalized is not undefined, then
          // add that to the output
          if (unNormalized) {
            d.unNormalizedValue = unNormalized;
          }

          return d;
        });
      });

      // return single array if the length is less than 2,
      // otherwise return array of arrays
      if (formattedResults.length < 2) {
        return formattedResults[0];
      }
      return formattedResults;
    }

    // if no meta exists, then return unformatted results;
    return unformattedResults;
  }

  /**
   * synchronous classify internal
   * @param {*} _input
   * @param {*} _cb
   */
  classifySyncInternal(_input) {
    const { meta } = this.neuralNetworkData;
    const headers = Object.keys(meta.inputs);

    let inputData;

    if (this.options.task === 'imageClassification') {
      // get the inputData for classification
      // if it is a image type format it and
      // flatten it
      inputData = this.searchAndFormat(_input);
      if (Array.isArray(inputData)) {
        inputData = inputData.flat();
      } else {
        inputData = inputData[headers[0]];
      }

      if (meta.isNormalized) {
        // TODO: check to make sure this property is not static!!!!
        const { min, max } = meta.inputs[headers[0]];
        inputData = this.neuralNetworkData.normalizeArray(Array.from(inputData), { min, max });
      } else {
        inputData = Array.from(inputData);
      }

      inputData = tf.tensor([inputData], [1, ...meta.inputUnits]);
    } else {
      inputData = this.formatInputsForPredictionAll(_input, meta, headers);
    }

    const unformattedResults = this.neuralNetwork.classifySync(inputData);
    inputData.dispose();

    if (meta !== null) {
      const label = Object.keys(meta.outputs)[0];
      const vals = Object.entries(meta.outputs[label].legend);

      const formattedResults = unformattedResults.map(unformattedResult => {
        return vals
          .map((item, idx) => {
            return {
              [item[0]]: unformattedResult[idx],
              label: item[0],
              confidence: unformattedResult[idx],
            };
          })
          .sort((a, b) => b.confidence - a.confidence);
      });

      // return single array if the length is less than 2,
      // otherwise return array of arrays
      if (formattedResults.length < 2) {
        return formattedResults[0];
      }
      return formattedResults;
    }

    return unformattedResults;
  }

  /**
   * classify
   * @param {*} _input
   * @param {*} _cb
   */
  async classifyInternal(_input) {
    const { meta } = this.neuralNetworkData;
    const headers = Object.keys(meta.inputs);

    let inputData;

    if (this.options.task === 'imageClassification') {
      // get the inputData for classification
      // if it is a image type format it and
      // flatten it
      inputData = this.searchAndFormat(_input);
      if (Array.isArray(inputData)) {
        inputData = inputData.flat();
      } else {
        inputData = inputData[headers[0]];
      }

      if (meta.isNormalized) {
        // TODO: check to make sure this property is not static!!!!
        const { min, max } = meta.inputs[headers[0]];
        inputData = this.neuralNetworkData.normalizeArray(Array.from(inputData), { min, max });
      } else {
        inputData = Array.from(inputData);
      }

      inputData = tf.tensor([inputData], [1, ...meta.inputUnits]);
    } else {
      inputData = this.formatInputsForPredictionAll(_input, meta, headers);
    }

    const unformattedResults = await this.neuralNetwork.classify(inputData);
    inputData.dispose();

    if (meta !== null) {
      const label = Object.keys(meta.outputs)[0];
      const vals = Object.entries(meta.outputs[label].legend);

      const formattedResults = unformattedResults.map(unformattedResult => {
        return vals
          .map((item, idx) => {
            return {
              [item[0]]: unformattedResult[idx],
              label: item[0],
              confidence: unformattedResult[idx],
            };
          })
          .sort((a, b) => b.confidence - a.confidence);
      });

      // return single array if the length is less than 2,
      // otherwise return array of arrays
      if (formattedResults.length < 2) {
        return formattedResults[0];
      }
      return formattedResults;
    }

    return unformattedResults;
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Save / Load Data
   * ////////////////////////////////////////////////////////////
   */

  /**
   * @public
   * saves the training data to a JSON file.
   * @param {string} [name] Optional - The name for the saved file.
   *  Should not include the file extension.
   *  Defaults to the current date and time.
   * @param {ML5Callback<void>} [callback] Optional - A function to call when the save is complete.
   * @return {Promise<void>}
   */
  async saveData(name, callback) {
    const args = handleArguments(name, callback);
    return callCallback(this.neuralNetworkData.saveData(args.name), args.callback);
  }

  /**
   * @public
   * load data
   * @param {string | FileList} filesOrPath - The URL of the file to load,
   *  or a FileList object (.files) from an HTML element <input type="file">.
   * @param {ML5Callback<void>} [callback] Optional - A function to call when the loading is complete.
   * @return {Promise<void>}
   */
  async loadData(filesOrPath, callback) {
    return callCallback(this.neuralNetworkData.loadData(filesOrPath), callback);
  }

  /**
   * ////////////////////////////////////////////////////////////
   * Save / Load Model
   * ////////////////////////////////////////////////////////////
   */

  /**
   * @public
   * saves the model, weights, and metadata
   * @param {string} [name] Optional - The name for the saved file.
   *  Should not include the file extension.
   *  Defaults to 'model'.
   * @param {ML5Callback<void[]>} [callback] Optional - A function to call when the save is complete.
   * @return {Promise<void[]>}
   */
  async save(name, callback) {
    const args = handleArguments(name, callback);
    const modelName = args.string || 'model';

    // save the model
    return callCallback(Promise.all([
      this.neuralNetwork.save(modelName),
      this.neuralNetworkData.saveMeta(modelName)
    ]), args.callback);
  }

  /**
   * @public
   * load a model and metadata
   * @param {string | FileList} filesOrPath - The URL of the file to load,
   *  or a FileList object (.files) from an HTML element <input type="file">.
   * @param {ML5Callback<void[]>} [callback] Optional - A function to call when the loading is complete.
   * @return {Promise<void[]>}
   */
  async load(filesOrPath, callback) {
    return callCallback(Promise.all([
      this.neuralNetwork.load(filesOrPath),
      this.neuralNetworkData.loadMeta(filesOrPath)
    ]), callback);
  }

  /**
   * dispose and release memory for a model
   */
  dispose() {
    this.neuralNetwork.dispose();
  }

  /**
   * ////////////////////////////////////////////////////////////
   * New methods for Neuro Evolution
   * ////////////////////////////////////////////////////////////
   */

  /**
   * mutate the weights of a model
   * @param {*} rate
   * @param {*} mutateFunction
   */

  mutate(rate, mutateFunction) {
    this.neuralNetwork.mutate(rate, mutateFunction);
  }

  /**
   * create a new neural network with crossover
   * @param {*} other
   */

  crossover(other) {
    const nnCopy = this.copy();
    nnCopy.neuralNetwork.crossover(other.neuralNetwork);
    return nnCopy;
  }
}

const neuralNetwork = (inputsOrOptions, outputsOrCallback, callback) => {
  let options;
  let cb;

  if (inputsOrOptions instanceof Object) {
    options = inputsOrOptions;
    cb = outputsOrCallback;
  } else {
    options = {
      inputs: inputsOrOptions,
      outputs: outputsOrCallback,
    };
    cb = callback;
  }

  const instance = new DiyNeuralNetwork(options, cb);
  return instance;
};

export default neuralNetwork;
