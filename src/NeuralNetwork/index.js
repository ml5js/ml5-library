// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Generic NeuralNetwork class
*/

import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import callCallback from '../utils/callcallback';
import {
  saveBlob
} from '../utils/io';
// import { input } from '@tensorflow/tfjs';
import DEFAULTS from './NeuralNetworkDefaults';
import NeuralNetworkData from './NeuralNetworkData';

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options, callback) {

    // Check if the model is ready
    this.ready = false;

    // Model Config
    this.config = {
      dataUrl: options.dataUrl || null,
      task: options.task || DEFAULTS.task,
      debug: options.debug || DEFAULTS.debug,
      activationHidden: options.activationHidden || DEFAULTS.activationHidden,
      activationOutput: options.activationOutput || DEFAULTS.activationOutput,
      inputs: options.inputs || DEFAULTS.inputs,
      outputs: options.outputs || DEFAULTS.outputs,
      noVal: options.noVal || options.outputs,
      hiddenUnits: options.hiddenUnits || DEFAULTS.hiddenUnits,
      learningRate: options.outputs || DEFAULTS.learningRate,
      modelMetrics: options.modelMetrics || DEFAULTS.modelMetrics,
      modelLoss: options.modelLoss || DEFAULTS.modelLoss,
      modelOptimizer: options.modelOptimizer || DEFAULTS.modelOptimizer,
      batchSize: options.batchSize || DEFAULTS.batchSize,
      epochs: options.epochs || DEFAULTS.epochs,
    }

    // Create an instance of NeuralNetworkData Class
    // to store data and apply data helper functions
    this.data = new NeuralNetworkData(options);

    // Create the model
    if (this.config.dataUrl !== null) {
      // If dataUrl is specified:
      // * load any relevant data
      // * run the getIOUnits() function to
      // * create the model
      this.ready = this.createModelFromData(callback);
    } else {
      // If dataUrl is not specified:
      // * set the inputUnits and outputUnits
      // * create the model
      this.data.meta.inputUnits = this.config.inputs;
      this.data.meta.outputUnits = this.config.outputs;
      // convert the inputs and outputs to arrays
      // if they are not specified this way already
      // e.g. input1, input2, input3
      // e.g. output1, output2, output3
      this.data.inputs = this.createNamedIO(this.config.inputs, 'input');
      this.data.outputs = this.createNamedIO(this.config.outputs, 'output');

      this.model = this.createModel();
      this.ready = true;
    }

  }

  /**
   * Takes in a number or array and then either returns
   * the array or returns an array of ['input0','input1']
   * the array or returns an array of ['output0','output1']
   * @param {*} val
   * @param {*} inputType
   */
  // eslint-disable-next-line class-methods-use-this
  createNamedIO(val, inputType) {
    console.log(val)
    const arr = (val instanceof Array) ? val : [...new Array(val).fill(null).map((item, idx) => `${inputType}${idx}`)]
    return arr;
  }

  /**
   * Create model from data
   * @param {*} callback
   */
  createModelFromData(callback) {
    return callCallback(this.createModelFromDataInternal(), callback)
  }

  async createModelFromDataInternal() {
    // load the data
    await this.loadData();
    // check the input columns for data type to
    // calculate the total number of inputs
    // and outputs
    this.data.getIOUnits();

    // create the model
    this.model = this.createModel();
  }


  async loadJSONInternal() {
    const outputLabels = this.config.outputs;
    const inputLabels = this.config.inputs;

    const data = await fetch(this.config.dataUrl);
    const json = await data.json();

    // TODO: recurse through the object to find
    // which object contains the
    let parentProp;
    if (Object.keys(json).includes('entries')) {
      parentProp = 'entries'
    } else if (Object.keys(json).includes('data')) {
      parentProp = 'data'
    } else {
      console.log(`your data must be contained in an array in \n
      a property called entries or data`);
      return;
    }

    const dataArray = json[parentProp];

    this.data.xs = dataArray.map(item => {
      const props = Object.keys(item);

      const output = {};
      props.forEach(prop => {
        if (inputLabels.includes(prop)) {
          output[prop] = item[prop]
        }
      })

      return output;
    })

    this.data.ys = dataArray.map(item => {
      const props = Object.keys(item);

      const output = {};
      props.forEach(prop => {
        if (outputLabels.includes(prop)) {
          output[prop] = item[prop]
        }
      })

      return output;
    })

    this.data.data = [];

    this.data.ys.forEach((item, idx) => {
      const output = {};
      output.xs = this.data.xs[idx]
      output.ys = this.data.ys[idx]
      this.data.data.push(output);
    })

    // TODO: check for int32, float32, bool, or string
    this.setDTypes();

  }

  async loadCSVInternal() {
    const outputLabels = this.config.outputs;
    const inputLabels = this.config.inputs;

    const inputConfig = {};
    inputLabels.forEach(label => {
      inputConfig[label] = {
        isLabel: false
      }
    });

    const outputConfig = {};
    outputLabels.forEach(label => {
      outputConfig[label] = {
        isLabel: true,
      }
    });

    this.data.tensor = tf.data.csv(this.config.dataUrl, {
      columnConfigs: {
        ...inputConfig,
        ...outputConfig
      },
      configuredColumnsOnly: true
    });


    let data = await this.data.tensor.toArray();

    // If the task is classification
    // then convert the numeric values to strings
    // to enable oneHot() encoding necessary
    // for classification to run
    if (this.config.task === 'classification') {
      data = data.map((item) => {
        const ys = {};
        Object.keys(item.ys).forEach((val) => {
          ys[val] = String(item.ys[val])
        })
        return Object.assign({
          ys
        }, {
          xs: item.xs
        })
      })
    }

    // TODO: not sure if this makes sense...
    this.data.data = data;

    data.forEach(item => {
      this.data.xs.push(item.xs);
      this.data.ys.push(item.ys);
    });

    // TODO: check for int32, float32, bool, or string
    this.setDTypes();

    // console.log(this.data.meta)

    if (this.config.debug) {
      outputLabels.forEach(outputLabel => {
        const values = inputLabels.map(label => {
          return data.map(item => {
            return {
              x: item.xs[label],
              y: item.ys[outputLabel]
            }
          })
        })

        tfvis.render.scatterplot({
          name: 'debug mode'
        }, {
          values
        }, {
          xLabel: 'X',
          yLabel: 'Y',
          height: 300
        });

      })
    }

  }

  /**
   * Set the datatypes for this.data.meta: inputTypes and outputTypes
   */
  setDTypes() {
    // TODO: check for int32, float32, bool, or string
    this.data.meta.inputTypes = Object.keys(this.data.data[0].xs).map(prop => {

      return {
        name: prop,
        dtype: typeof this.data.data[0].xs[prop]
      }

    })
    this.data.meta.outputTypes = Object.keys(this.data.data[0].ys).map(prop => {

      return {
        name: prop,
        dtype: typeof this.data.data[0].ys[prop]
      }

    })

  }


  /**
   * Loads data if a dataUrl is specified in the
   * constructor
   */
  async loadData() {
    if (this.config.dataUrl.endsWith('.csv')) {
      await this.loadCSVInternal();
    } else if (this.config.dataUrl.endsWith('.json')) {
      await this.loadJSONInternal();
    } else {
      console.log('Not a valid data format. Must be csv or json')
    }
  }


  /**
   * createModel()
   * Depending on the task -- classification or regression -- returns a simple model architecture
   */
  createModel() {

    switch (this.config.task) {

      case 'regression': // Create a model for regression
        // set regression model parameters
        // this.config.modelOptimizer = tf.train.sgd(this.config.learningRate);
        this.config.modelOptimizer = tf.train.adam(this.config.learningRate);

        return this.createModelInternal();

      case 'classification': // Create a model for classification

        this.config.hiddenUnits = 16;
        this.config.activationHidden = 'sigmoid' // 'relu',
        this.config.activationOutput = 'softmax' // 'relu',
        this.config.modelLoss = 'categoricalCrossentropy'
        this.config.modelOptimizer = tf.train.sgd(DEFAULTS.learningRate); // tf.train.adam();

        return this.createModelInternal();

      default:
        // the default is a regression, but if something else is
        // specified a user will just get tf.sequential()
        console.log('no model exists for this type of task yet!');
        return tf.sequential();
    }
  }

  /**
   * createModelInternal()
   * Creates a sequential model with 1 hidden layer, and 1 output layer
   */
  createModelInternal() {
    const model = tf.sequential();

    const hidden = tf.layers.dense({
      units: this.config.hiddenUnits,
      inputShape: [this.data.meta.inputUnits],
      activation: this.config.activationHidden,
    });

    // TODO: figure out if we want to add in the ability to add more layers?

    const output = tf.layers.dense({
      units: this.data.meta.outputUnits,
      activation: this.config.activationOutput,
    });

    model.add(hidden);
    model.add(output);

    model.compile({
      optimizer: this.config.modelOptimizer,
      loss: this.config.modelLoss,
      metrics: this.config.modelMetrics,
    });

    if (this.config.debug) {
      tfvis.show.modelSummary({
        name: 'Model Summary'
      }, model);
    }

    return model;
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
    const batchSize = options.batchSize || this.config.batchSize;
    const epochs = options.epochs || this.config.epochs;

    const whileTraining = (typeof whileTrainingCallback === 'function') ?
      whileTrainingCallback : (epoch, logs) => console.log(`Epoch: ${epoch} - accuracy: ${logs.loss.toFixed(3)}`);

    let xs;
    let ys;
    const {
      inputs,
      targets
    } = this.data.normalizedData.tensors;

    targets.print();

    // check if the inputs are tensors, if not, convert!
    if (!(inputs instanceof tf.Tensor)) {
      xs = tf.tensor(inputs)
      ys = tf.tensor(targets)
    } else {
      xs = inputs;
      ys = targets;
    }

    let modelFitCallbacks;
    if (this.config.debug) {
      modelFitCallbacks = [tfvis.show.fitCallbacks({
        name: 'Training Performance'
      },
        ['loss', 'accuracy'], {
        height: 200,
        callbacks: ['onEpochEnd']
      }
      ),
      {
        onEpochEnd: whileTraining
      },
      {
        onTrainEnd: () => console.log(`training complete!`)
      },
      ]
    } else {
      modelFitCallbacks = []
    }

    await this.model.fit(xs, ys, {
      shuffle: true,
      batchSize,
      epochs,
      validationSplit: 0.1,
      callbacks: modelFitCallbacks
    });
    xs.dispose();
    ys.dispose();
  }


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
   * Userfacing prediction function
   * @param {*} input
   * @param {*} callback
   */
  predict(input, callback) {
    return callCallback(this.predictInternal(input), callback);
  }

  /**
   * Make a prediction based on the given input
   * @param {*} sample
   */
  async predictInternal(sample) {

    // Handle the input sample
    // either an array of values in order of the inputs
    // OR an JSON object of key/values

    let inputData = [];
    if (sample instanceof Array) {

      inputData = sample;

    } else if (sample instanceof Object) {

      // TODO: check if the input order is preserved!
      const headers = this.data.inputs;
      inputData = headers.map(prop => {
        return sample[prop]
      });

    }

    // TODO: We need to normalize/oneHot encode the inputs 
    // Check this.data.meta.inputUnits | this.data.meta.outputUnits 
    // for relevant info. 
    // for each input/output to use them here AND for unnormalizing for outputs
    let normalizedInputData  = [] 
    this.data.meta.inputTypes.forEach( (item, idx) => {
      
      if(item.dtype === 'number'){
        const val = (inputData[idx] - item.min) / (item.max - item.min);
        normalizedInputData.push(val);
      } else if( item.dtype === 'string'){
        const val = item.legend[inputData[idx]]
        normalizedInputData = [...normalizedInputData, ...val]
      }
    })

    const xs = tf.tensor(normalizedInputData, [1, sample.length]);
    const ys = this.model.predict(xs);

    let results;
    if (this.config.task === 'classification') {
      
      const predictions = await ys.data();
      
      // TODO: Check to see if this fails with numeric values 
      // since no legend exists
      const outputData = this.data.meta.outputTypes.map( (arr) => {
        return Object.keys(arr.legend).map( (k, idx) => {
            return {label: k, confidence: predictions[idx]}
          }).sort( (a, b) => b.confidence - a.confidence);
      });

      results = {
        output: outputData,
        tensor: ys
      }
    } else {
      results = {
        output: await ys.data(),
        tensor: ys
      }
    }

    xs.dispose();

    return results;
  }


  /**
   * Save the model and weights
   * @param {*} callback
   * @param {*} name
   */
  async save(callback, name) {
    this.model.save(tf.io.withSaveHandler(async (data) => {
      let modelName = 'model';
      if (name) modelName = name;

      this.weightsManifest = {
        modelTopology: data.modelTopology,
        weightsManifest: [{
          paths: [`./${modelName}.weights.bin`],
          weights: data.weightSpecs,
        }]
      };
      await saveBlob(data.weightData, `${modelName}.weights.bin`, 'application/octet-stream');
      await saveBlob(JSON.stringify(this.weightsManifest), `${modelName}.json`, 'text/plain');
      if (callback) {
        callback();
      }
    }));
  }

  /**
   * Load the model and weights in from a file
   * @param {*} filesOrPath
   * @param {*} callback
   */
  async load(filesOrPath = null, callback) {
    if (typeof filesOrPath !== 'string') {
      let model = null;
      let weights = null;
      Array.from(filesOrPath).forEach((file) => {
        if (file.name.includes('.json')) {
          model = file;
          const fr = new FileReader();
          fr.readAsText(file);
        } else if (file.name.includes('.bin')) {
          weights = file;
        }
      });
      this.model = await tf.loadLayersModel(tf.io.browserFiles([model, weights]));
    } else {
      fetch(filesOrPath)
        .then(r => r.json());
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