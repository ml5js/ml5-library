// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Generic NeuralNetwork class
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import {
  saveBlob
} from '../utils/io';
// import { input } from '@tensorflow/tfjs';
import DEFAULTS from './NeuralNetworkDefaults';
import NeuralNetworkData from './NeuralNetworkData';
import NeuralNetworkVis from './NeuralNetworkVis';

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options, callback) {
    // model config
    this.config = {
      // debugging
      debug: options.debug || DEFAULTS.debug,
      returnTensors: options.returnTensors || DEFAULTS.returnTensors,
      // architecture
      architecture: {
        task: options.task || DEFAULTS.task,
        // array of layers, the last is always the output layer
        layers: options.layers || [],
        // array of activations corresponding to the layer number
        activations: [],
        // hiddenUnits
        hiddenUnits: options.hiddenUnits || DEFAULTS.hiddenUnits,
        // the units of the layers will come from the config.dataOptions
      },
      training: {
        // defined either on instantiation or in .train(options)
        batchSize: options.batchSize || DEFAULTS.batchSize,
        epochs: options.epochs || DEFAULTS.epochs,
        // will depend on the config.architecture.task
        learningRate: options.learningRate || DEFAULTS.learningRate,
        modelMetrics: options.modelMetrics || DEFAULTS.modelMetrics,
        modelLoss: options.modelLoss || DEFAULTS.modelLoss,
        modelOptimizer: options.modelOptimizer || DEFAULTS.modelOptimizer,
      },
      // data
      dataOptions: {
        dataUrl: options.dataUrl || null,
        inputs: options.inputs || DEFAULTS.inputs,
        outputs: options.outputs || DEFAULTS.outputs,
        // TODO: adding option for normalization
        normalizationOptions: options.normalizationOptions || null
      },

    }


    // TODO: maybe we create a set of configs for
    // regression vs. classification
    // set the default activations:
    if (this.config.architecture.task === 'regression') {
      // current defaults are for regression
      const activationHidden = options.activationHidden || DEFAULTS.activationHidden;
      const activationOutput = options.activationOutput || DEFAULTS.activationOutput;

      this.config.training.modelOptimizer = options.modelOptimizer || tf.train.adam(this.config.training.learningRate);
      this.config.architecture.activations = [activationHidden, activationOutput];
    } else if (this.config.architecture.task === 'classification') {
      // set classification specs different from regression in DEFAULTS
      const activationHidden = options.activationHidden || DEFAULTS.activationHidden;
      const activationOutput = options.activationOutput || 'softmax';

      this.config.architecture.activations = [activationHidden, activationOutput];
      this.config.training.modelLoss = options.modelLoss || 'categoricalCrossentropy';
      this.config.training.modelOptimizer = options.modelOptimizer || tf.train.sgd(this.config.training.learningRate);
    } else {
      console.log(`task not defined. please set task: classification OR regression`);
    }

    // vis class
    this.vis = new NeuralNetworkVis();
    // data class
    this.data = new NeuralNetworkData(this.config);
    // check if the model is ready
    this.ready = false;
    // the model
    this.model = null;

    // initialize
    this.init(callback);

  }

  /**
   * ----------------------------------------
   * --- model creation / initialization ----
   * ----------------------------------------
   */

  /**
   * Initialize the model creation
   */
  init(callback) {
    // Create the model based on data or the inputs/outputs
    if (this.config.dataOptions.dataUrl !== null) {
      this.ready = this.createModelFromData(callback);
    } else {
      // --- set the input/output units ---
      const inputIOUnits = this.initializeIOUnits(this.config.dataOptions.inputs, 'inputs');
      this.data.meta.inputUnits = inputIOUnits.units;
      this.data.config.dataOptions.inputs = inputIOUnits.labels;

      const outputIOUnits = this.initializeIOUnits(this.config.dataOptions.outputs, 'outputs');
      this.data.meta.outputUnits = outputIOUnits.units;
      this.data.config.dataOptions.outputs = outputIOUnits.labels;

      this.ready = true;
    }
  }

  /**
   * if the inputs is a number
   * then set the inputUnits as the number
   * and then create an array of input labels
   * if not, then use what is given
   * @param {*} input
   * @param {*} ioType
   */
  initializeIOUnits(input, ioType) {
    let units;
    let labels;
    let ioLabel;

    if (ioType === 'outputs') {
      ioLabel = 'output'
    } else {
      ioLabel = 'input'
    }

    if (typeof input === 'number') {
      units = input;
      labels = this.data.createNamedIO(input, ioLabel);
    } else if (Array.isArray(input)) {
      units = input.length;
      labels = input;
    } else {
      console.log(`${ioType} in this format are not supported`)
    }

    return {
      units,
      labels
    };

  }

  /**
   * create Model
   */
  createModel() {

    switch (this.config.architecture.task) {
      case 'regression':
        // if the layers are not defined default to a
        // neuralnet with 2 layers
        this.defineModelLayers();
        return this.createModelInternal();
      case 'classification':
        // if the layers are not defined default to a
        // neuralnet with 2 layers
        this.defineModelLayers();
        return this.createModelInternal();
      default:
        console.log('no model exists for this type of task yet!');
        return tf.sequential();
    }
  }

  /**
   * Define the model layers
   */
  defineModelLayers() {
    if (!this.config.architecture.layers.length > 0) {
      this.config.architecture.layers = [];

      const {
        activations,
        hiddenUnits
      } = this.config.architecture;

      const hidden = tf.layers.dense({
        units: hiddenUnits,
        inputShape: [this.data.meta.inputUnits],
        activation: activations[0],
      });

      const output = tf.layers.dense({
        units: this.data.meta.outputUnits,
        activation: activations[1],
      });

      this.config.architecture.layers = [hidden, output];

    }
  }


  createModelInternal() {
    const model = tf.sequential();

    // add the layers to the model as defined in config.architecture.layers
    this.config.architecture.layers.forEach(layer => {
      model.add(layer);
    });

    // compile the model
    const {
      modelOptimizer,
      modelLoss,
      modelMetrics
    } = this.config.training;

    model.compile({
      optimizer: modelOptimizer,
      loss: modelLoss,
      metrics: modelMetrics,
    });

    return model;
  }

  /**
   * create model from data
   * @param {*} callback
   */
  createModelFromData(callback) {
    return callCallback(this.createModelFromDataInternal(), callback)
  }

  /**
   * Creates model architecture from the loaded data
   */
  async createModelFromDataInternal() {
    // load the data
    await this.data.loadData();
    // check the input columns for data type to
    // calculate the total number of inputs
    // and outputs
    this.data.getIOUnits();
  }

  /**
   * ----------------------------------------
   * ----- adding data / training -----------
   * ----------------------------------------
   */
  /**
   * Adds an endpoint to call data.addData()
   * @param {*} xs
   * @param {*} ys
   */
  addData(xs, ys) {
    this.data.addData(xs, ys);
  }

  /**
   * normalize the data.raw
   */
  normalizeData() {
    this.data.normalize();
  }


  /**
   * User-facing neural network training
   * @param {*} optionsOrCallback
   * @param {*} callback
   */
  train(optionsOrCallback, optionsOrWhileTraining, callback) {
    let options;
    let whileTrainingCb;
    let finishedTrainingCb;
    if (typeof optionsOrCallback === 'object' &&
      typeof optionsOrWhileTraining === 'function' &&
      typeof callback === 'function'
    ) {
      options = optionsOrCallback;
      whileTrainingCb = optionsOrWhileTraining;
      finishedTrainingCb = callback;
    } else if (typeof optionsOrCallback === 'object' &&
      typeof optionsOrWhileTraining === 'function') {
      options = optionsOrCallback;
      whileTrainingCb = null;
      finishedTrainingCb = optionsOrWhileTraining;
    } else if (typeof optionsOrCallback === 'function' &&
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
   * Train the neural network
   * @param {*} options
   */
  async trainInternal(options, whileTrainingCallback) {
    // get batch size and epochs
    const batchSize = options.batchSize || this.config.training.batchSize;
    const epochs = options.epochs || this.config.training.epochs;

    // placeholder for whiletraining callback;
    let whileTraining;
    // if debug is true, show tf vis during model training
    // if not, then use whileTraining
    let modelFitCallbacks;

    // placeholder for xs and ys data for training
    let xs;
    let ys;

    // check if data are normalized, run the data.warmUp before training
    if (!this.data.meta.isNormalized) {
      this.data.warmUp();
    }

    // Get the inputs and outputs from the data object
    // Ensure this comes AFTER .warmUp() in case 
    // .normalizeData() has not been called.
    const {
      inputs,
      outputs
    } = this.data.data.tensor;

    // Create the model when train is called
    // important that this comes after checking if .isNormalized
    this.model = this.createModel();

    // check if a whileTrainingCallback was passed
    if (typeof whileTrainingCallback === 'function') {
      whileTraining = whileTrainingCallback;
    } else {
      whileTraining = () => null;
    }

    // check if the inputs are tensors, if not, convert!
    if (!(inputs instanceof tf.Tensor)) {
      xs = tf.tensor(inputs)
      ys = tf.tensor(outputs)
    } else {
      xs = inputs;
      ys = outputs;
    }

    // check if the debug mode is on to specify model fit callbacks
    if (this.config.debug) {
      modelFitCallbacks = [
        this.vis.trainingVis(),
        {
          onEpochEnd: whileTraining
        }
      ]
    } else {
      modelFitCallbacks = [{
        onEpochEnd: whileTraining
      }]
    }

    // train the model
    await this.model.fit(xs, ys, {
      shuffle: true,
      batchSize,
      epochs,
      validationSplit: 0.1,
      callbacks: modelFitCallbacks
    });
    // dispose of the xs and ys
    xs.dispose();
    ys.dispose();
  }


  /**
   * ----------------------------------------
   * ----- prediction / classification-------
   * ----------------------------------------
   */
  /**
   * Classify()
   * Runs the classification if the neural network is doing a
   * classification task
   * @param {*} input
   * @param {*} callback
   */
  classify(input, callback) {
    return callCallback(this.predictInternal(input), callback);
  }

  /**
   * classifyMultiple()
   * Runs the classification task on multiple inputs
   * @param {*} input
   * @param {*} callback
   */
  classifyMultiple(input, callback) {
    return callCallback(this.predictMultipleInternal(input), callback);
  }

  /**
   * User-facing prediction function
   * @param {*} input
   * @param {*} callback
   */
  predict(input, callback) {
    return callCallback(this.predictInternal(input), callback);
  }

  /**
   * User-facing prediction function for multiple inputs
   * @param {*} input
   * @param {*} callback
   */
  predictMultiple(input, callback) {
    return callCallback(this.predictMultipleInternal(input), callback);
  }

  /**
   * Make a prediction based on the given input
   * @param {*} sample
   */
  async predictMultipleInternal(sampleList) {

    // 1. Handle the input sample
    const inputData = [];
    sampleList.forEach(sample => {
      let inputRow = [];
      if (sample instanceof Array) {
        inputRow = sample;
      } else if (sample instanceof Object) {
        // TODO: make sure that the input order is preserved!
        const headers = this.data.config.dataOptions.inputs;
        inputRow = headers.map(prop => {
          return sample[prop]
        });
      }
      inputData.push(inputRow);
    });


    // 2. onehot encode the sample if necessary
    const encodedInput = [];

    sampleList.forEach(item => {
      let encodedInputRow = [];
      Object.entries(this.data.meta.inputs).forEach((arr) => {
        const prop = arr[0];
        const {
          dtype
        } = arr[1];

        // to ensure that we get the value in the right order
        const valIndex = this.data.config.dataOptions.inputs.indexOf(prop);
        const val = item[valIndex];

        if (dtype === 'number') {
          let normVal;
          // if the data has not been normalized, just send in the raw sample
          if (!this.data.meta.isNormalized) {
            normVal = val;
          } else {
            const {
              inputMin,
              inputMax
            } = this.data.data;
            normVal = val;
            if (inputMin && inputMax) {
              normVal = (val - inputMin[valIndex]) / (inputMax[valIndex] - inputMin[valIndex]);
            }
          }
          encodedInputRow.push(normVal);
        } else if (dtype === 'string') {
          const {
            legend
          } = arr[1];
          const onehotVal = legend[val]
          encodedInputRow = [...encodedInputRow, ...onehotVal]
        }

        encodedInput.push(encodedInputRow);
      });

    });



    // Step 3: make the prediction
    const xs = tf.tensor(encodedInput, [encodedInput.length, this.data.meta.inputUnits]);
    const ys = this.model.predict(xs);

    // ys.print();

    // Step 4: Convert the outputs back to the recognizable format
    let results = [];

    if (this.config.architecture.task === 'classification') {
      const predictions = await ys.array();
      // TODO: Check to see if this fails with numeric values
      // since no legend exists
      const outputData = predictions.map(prediction => {
        return Object.entries(this.data.meta.outputs).map((arr) => {
          const {
            legend
          } = arr[1];
          // TODO: the order of the legend items matters
          // Likey this means instead of `.push()`,
          // we should do .unshift()
          // alternatively we can use 'reverse()' here.
          return Object.entries(legend).map((legendArr, idx) => {
            const prop = legendArr[0];
            return {
              label: prop,
              confidence: prediction[idx]
            }
          }).sort((a, b) => b.confidence - a.confidence);
        })[0];
      })
      // NOTE: we are doing a funky javascript thing
      // setting an array as results, then adding
      // .tensor as a property of that array object
      results = outputData;

      // conditionally return the tensors if specified in options
      if(this.config.returnTensors){
        results.tensor = ys;
      } else {
        results.tensor = null;
        ys.dispose();
      }
      

    } else if (this.config.architecture.task === 'regression') {
      const predictions = await ys.array();

      const outputData = predictions.map(prediction => {
        return Object.entries(this.data.meta.outputs).map((item, idx) => {
          const prop = item[0];
          const {
            outputMin,
            outputMax
          } = this.data.data;
          let val;
          if (!this.data.meta.isNormalized) {
            val = prediction[idx]
          } else {
            val = (prediction[idx] * (outputMax[idx] - outputMin[idx])) + outputMin[idx];
          }

          return {
            value: val,
            label: prop
          }
        });
      })


      // NOTE: we are doing a funky javascript thing
      // setting an array as results, then adding
      // .tensor as a property of that array object
      results = outputData;

      // conditionally return the tensors if specified in options
      if(this.config.returnTensors){
        results.tensor = ys;
      } else {
        results.tensor = null;
        ys.dispose();
      }
    }

    xs.dispose();
    return results;

  }

  /**
   * Make a prediction based on the given input
   * @param {*} sample
   */
  async predictInternal(sample) {
    // 1. Handle the input sample
    // either an array of values in order of the inputs
    // OR an JSON object of key/values
    // console.log(sample)

    let inputData = [];
    if (sample instanceof Array) {
      inputData = sample;
    } else if (sample instanceof Object) {
      // TODO: make sure that the input order is preserved!
      const headers = this.data.config.dataOptions.inputs;
      inputData = headers.map(prop => {
        return sample[prop]
      });
    }


    // 2. onehot encode the sample if necessary
    let encodedInput = [];

    Object.entries(this.data.meta.inputs).forEach((arr) => {
      const prop = arr[0];
      const {
        dtype
      } = arr[1];

      // to ensure that we get the value in the right order
      const valIndex = this.data.config.dataOptions.inputs.indexOf(prop);
      const val = inputData[valIndex];

      if (dtype === 'number') {
        let normVal;
        // if the data has not been normalized, just send in the raw sample
        if (!this.data.meta.isNormalized) {
          normVal = val;
        } else {
          const {
            inputMin,
            inputMax
          } = this.data.data;
          normVal = val;
          if (inputMin && inputMax) {
            normVal = (val - inputMin[valIndex]) / (inputMax[valIndex] - inputMin[valIndex]);
          }
        }
        encodedInput.push(normVal);
      } else if (dtype === 'string') {
        const {
          legend
        } = arr[1];
        const onehotVal = legend[val]
        encodedInput = [...encodedInput, ...onehotVal]
      }

    })

    const xs = tf.tensor(encodedInput, [1, this.data.meta.inputUnits]);
    const ys = this.model.predict(xs);

    let results = [];

    if (this.config.architecture.task === 'classification') {
      const predictions = await ys.data();
      // TODO: Check to see if this fails with numeric values
      // since no legend exists
      const outputData = Object.entries(this.data.meta.outputs).map((arr) => {
        const {
          legend
        } = arr[1];
        // TODO: the order of the legend items matters
        // Likey this means instead of `.push()`,
        // we should do .unshift()
        // alternatively we can use 'reverse()' here.
        return Object.entries(legend).map((legendArr, idx) => {
          const prop = legendArr[0];
          return {
            label: prop,
            confidence: predictions[idx]
          }
        }).sort((a, b) => b.confidence - a.confidence);
      })[0];

      // NOTE: we are doing a funky javascript thing
      // setting an array as results, then adding
      // .tensor as a property of that array object
      results = outputData;
      // conditionally return the tensors if specified in options
      if(this.config.returnTensors){
        results.tensor = ys;
      } else {
        results.tensor = null;
        ys.dispose();
      }

    } else if (this.config.architecture.task === 'regression') {
      const predictions = await ys.data();


      const outputData = Object.entries(this.data.meta.outputs).map((item, idx) => {
        const prop = item[0];
        const {
          outputMin,
          outputMax
        } = this.data.data;
        let val;
        if (!this.data.meta.isNormalized) {
          val = predictions[idx]
        } else {
          val = (predictions[idx] * (outputMax[idx] - outputMin[idx])) + outputMin[idx];
        }

        return {
          value: val,
          label: prop
        }
      });


      // NOTE: we are doing a funky javascript thing
      // setting an array as results, then adding
      // .tensor as a property of that array object
      results = outputData;
      // conditionally return the tensors if specified in options
      if(this.config.returnTensors){
        results.tensor = ys;
      } else {
        results.tensor = null;
        ys.dispose();
      }
    }

    xs.dispose();
    return results;


  }




  /**
   * ----------------------------------------
   * ----- Exporting / Saving ---------------
   * ----------------------------------------
   */

  /**
   * Calls this.data.saveData() to save data out to a json file
   * @param {*} callback
   * @param {*} name
   */
  async saveData(nameOrCallback, callback) {
    let cb;
    let outputName;

    // check the inputs
    if (typeof nameOrCallback === 'string' && callback) {
      outputName = nameOrCallback
      cb = callback;
    } else if (typeof nameOrCallback === 'string' && !callback) {
      cb = null;
      outputName = nameOrCallback
    } else if (typeof nameOrCallback === 'function') {
      cb = nameOrCallback
      outputName = undefined;
    }

    // save the data out
    await this.data.saveData(outputName);

    if (typeof cb === 'function') {
      cb();
    }
  }

  /**
   * loadData from fileinput or path
   * @param {*} filesOrPath
   * @param {*} callback
   */
  async loadData(filesOrPath = null, callback) {

    let loadedData;
    if (typeof filesOrPath !== 'string') {
      const file = filesOrPath[0];
      const fr = new FileReader();
      fr.readAsText(file);
      if (file.name.includes('.json')) {
        const temp = await file.text();
        loadedData = JSON.parse(temp);
      } else {
        console.log('data must be a json object containing an array called "data" or "entries')
      }
    } else {
      loadedData = await fetch(filesOrPath);
      const text = await loadedData.text();
      if (this.data.isJsonString(text)) {
        loadedData = JSON.parse(text);
      } else {
        console.log('Whoops! something went wrong. Either this kind of data is not supported yet or there is an issue with .loadData')
      }
    }

    // check if a data or entries property exists
    if (loadedData.data) {
      this.data.data.raw = loadedData.data;
    } else if (loadedData.entries) {
      this.data.data.raw = loadedData.entries;
    } else {
      console.log('data must be a json object containing an array called "data" or "entries')
    }

    if (callback) {
      callback();
    }
  }


  /**
   * Save the model and weights
   * @param {*} callback
   * @param {*} name
   */
  async save(nameOrCallback, callback) {
    let cb;
    let outputName;

    // check the inputs
    if (typeof nameOrCallback === 'string' && callback) {
      outputName = nameOrCallback
      cb = callback;
    } else if (typeof nameOrCallback === 'string' && !callback) {
      cb = null;
      outputName = nameOrCallback
    } else if (typeof nameOrCallback === 'function') {
      cb = nameOrCallback
      outputName = undefined;
    }

    this.model.save(tf.io.withSaveHandler(async (data) => {
      let modelName = 'model';
      if (outputName) modelName = outputName;

      this.weightsManifest = {
        modelTopology: data.modelTopology,
        weightsManifest: [{
          paths: [`./${modelName}.weights.bin`],
          weights: data.weightSpecs,
        }]
      };

      const dataMeta = {
        data: {
          inputMin: this.data.data.inputMin,
          inputMax: this.data.data.inputMax,
          outputMin: this.data.data.outputMin,
          outputMax: this.data.data.outputMax,
        },
        meta: this.data.meta
      }

      await saveBlob(data.weightData, `${modelName}.weights.bin`, 'application/octet-stream');
      await saveBlob(JSON.stringify(this.weightsManifest), `${modelName}.json`, 'text/plain');
      await saveBlob(JSON.stringify(dataMeta), `${modelName}_meta.json`, 'text/plain');

      if (typeof cb === 'function') {
        cb();
      }
    }));
  }

  /**
   * Load the model and weights in from a file
   * @param {*} filesOrPath
   * @param {*} callback
   */
  async load(filesOrPath = null, callback) {

    if (filesOrPath instanceof FileList) {
      
      const files = await Promise.all(
        Array.from(filesOrPath).map( async (file) => {
          if (file.name.includes('model.json')) {
            return {name:"model", file}
          } else if (file.name.includes('_meta.json')) {
            const modelMetadata = await file.text();
            return {name: "metadata", file:modelMetadata}
          } else if (file.name.includes('.bin')) {
            return {name:"weights", file}
          }
          return {name:null, file:null}
        })
       )

      const model = files.find(item => item.name === 'model').file;
      const modelMetadata = JSON.parse(files.find(item => item.name === 'metadata').file);
      const weights = files.find(item => item.name === 'weights').file;

      // set the metainfo
      this.data.data.inputMax = modelMetadata.data.inputMax;
      this.data.data.inputMin = modelMetadata.data.inputMin;
      this.data.data.outputMax = modelMetadata.data.outputMax;
      this.data.data.outputMin = modelMetadata.data.outputMin;
      this.data.meta = modelMetadata.meta;

      // load the model
      this.model = await tf.loadLayersModel(tf.io.browserFiles([model, weights]));

    } else if(filesOrPath instanceof Object){
      // filesOrPath = {model: URL, metadata: URL, weights: URL}
      
      let modelMetadata = await fetch(filesOrPath.metadata);
      modelMetadata = await modelMetadata.text();
      modelMetadata = JSON.parse(modelMetadata);

      let modelJson = await fetch(filesOrPath.model);
      modelJson = await modelJson.text();
      const modelJsonFile = new File([modelJson], 'model.json', {type: 'application/json'});

      let weightsBlob = await fetch(filesOrPath.weights);
      weightsBlob = await weightsBlob.blob();
      const weightsBlobFile = new File([weightsBlob], 'model.weights.bin', {type: 'application/macbinary'});
      
      this.data.data.inputMax = modelMetadata.data.inputMax;
      this.data.data.inputMin = modelMetadata.data.inputMin;
      this.data.data.outputMax = modelMetadata.data.outputMax;
      this.data.data.outputMin = modelMetadata.data.outputMin;
      this.data.meta = modelMetadata.meta;

      this.model = await tf.loadLayersModel(tf.io.browserFiles([modelJsonFile, weightsBlobFile]));

    } else {
      const metaPath = `${filesOrPath.substring(0, filesOrPath.lastIndexOf("/"))}/model_meta.json`;
      let modelMetadata = await fetch(metaPath);
      modelMetadata = await modelMetadata.json();

      this.data.data.inputMax = modelMetadata.data.inputMax;
      this.data.data.inputMin = modelMetadata.data.inputMin;
      this.data.data.outputMax = modelMetadata.data.outputMax;
      this.data.data.outputMin = modelMetadata.data.outputMin;
      this.data.meta = modelMetadata.meta;

      this.model = await tf.loadLayersModel(filesOrPath);
    }
    if (callback) {
      callback();
    }
    return this.model;
  }

}




/**
 * Create an instance of the NeuralNetwork
 * @param {*} inputsOrOptions
 * @param {*} outputsOrCallback
 * @param {*} callback
 */
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

  const instance = new NeuralNetwork(options, cb);
  return instance;
};

export default neuralNetwork;