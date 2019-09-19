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
    // ??? Proposal???
    // TODO: does it make sense to split this up?
    /**
     this.config = {
        debug: options.debug || DEFAULTS.debug,
        data:{
          inputs: options.inputs || DEFAULTS.inputs,
          outputs: options.outputs || DEFAULTS.outputs,
          dataUrl: options.dataUrl || null,
          noVal: options.noVal || options.outputs,
        }.
        architecture:{
          task: options.task || DEFAULTS.task,
          activationHidden: options.activationHidden || DEFAULTS.activationHidden,
          activationOutput: options.activationOutput || DEFAULTS.activationOutput,
          hiddenUnits: options.hiddenUnits || DEFAULTS.hiddenUnits,
          learningRate: options.outputs || DEFAULTS.learningRate,
          modelMetrics: options.modelMetrics || DEFAULTS.modelMetrics,
          modelLoss: options.modelLoss || DEFAULTS.modelLoss,
          modelOptimizer: options.modelOptimizer || DEFAULTS.modelOptimizer,
        },
        training:{
          batchSize: options.batchSize || DEFAULTS.batchSize,
          epochs: options.epochs || DEFAULTS.epochs,
        },
     }
     */

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
    }

  }

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
    this.getIOUnits();

    // create the model
    this.model = this.createModel();
  }

  /**
   * Gets the total number of inputs/outputs based on the data type 
   * Uses the relevant function to convert values e.g. oneHot() and 
   * sends back the appropriate length of values
   * @param {*} val 
   */
  getIOUnits() {
    let inputUnits = 0;
    let outputUnits = 0;


    this.data.meta.inputTypes.forEach((item) => {
      if (item.dtype === 'number') {
        inputUnits += 1;
      } else if (item.dtype === 'string') {
        const uniqueVals = [...new Set(this.data.xs.map(obj => obj[item.name]))]
        inputUnits += uniqueVals.length;
      }
    });

    this.data.meta.outputTypes.forEach((item) => {
      if (item.dtype === 'number') {
        outputUnits += 1;
      } else if (item.dtype === 'string') {
        const uniqueVals = [...new Set(this.data.ys.map(obj => obj[item.name]))]
        outputUnits += uniqueVals.length;
      }
    });

    console.log(inputUnits, outputUnits)

    this.data.meta.inputUnits = inputUnits;
    this.data.meta.outputUnits = outputUnits;

  }


  /**
   * Loads data if a dataUrl is specified in the 
   * constructor
   */
  async loadData() {
    const outputLabel = this.config.outputs[0];
    const inputLabels = this.config.inputs;

    const inputConfig = {};
    inputLabels.forEach(label => {
      inputConfig[label] = {
        isLabel: false
      }
    });

    this.data.tensor = tf.data.csv(this.config.dataUrl, {
      columnConfigs: {
        ...inputConfig,
        [outputLabel]: {
          isLabel: true
        }
      },
      configuredColumnsOnly: true
    });

    const data = await this.data.tensor.toArray();
    // TODO: not sure if this makes sense...
    this.data.data = data;

    data.forEach(item => {
      this.data.xs.push(item.xs);
      this.data.ys.push(item.ys);
    });

    // TODO: check for int32, float32, bool, or string
    this.data.meta.inputTypes = Object.keys(data[0].xs).map(prop => ({
      name: prop,
      dtype: typeof data[0].xs[prop]
    }))
    this.data.meta.outputTypes = Object.keys(data[0].ys).map(prop => ({
      name: prop,
      dtype: typeof data[0].ys[prop]
    }))

    // console.log(this.data.meta)

    if (this.config.debug) {
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
        this.config.modelOptimizer = tf.train.adam();

        return this.createModelInternal();

      case 'classification': // Create a model for classification
        // set classification model parameters
        this.config.hiddenUnits = 16;
        this.config.activationHidden = 'relu' // 'relu',
        this.config.activationOutput = 'softmax' // 'relu',
        this.config.modelLoss = 'categoricalCrossentropy'
        this.config.modelOptimizer = tf.train.adam();

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
  train(optionsOrCallback, callback) {
    let options;
    let cb;
    if (typeof optionsOrCallback === 'object') {
      options = optionsOrCallback;
      cb = callback
    } else {
      options = {}
      cb = optionsOrCallback;
    }

    return callCallback(this.trainInternal(options), cb);
  }

  /**
   * Train the neural network
   * @param {*} options 
   */
  async trainInternal(options) {
    const batchSize = options.batchSize || this.config.batchSize;
    const epochs = options.epochs || this.config.epochs;

    let xs;
    let ys;
    const {
      inputs,
      targets
    } = this.data.normalizedData;

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
          onEpochEnd: (epoch, logs) => console.log(`Epoch: ${epoch} - accuracy: ${logs.loss.toFixed(3)}`)
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
    const xs = tf.tensor(sample, [1, sample.length]);
    const ys = this.model.predict(xs);

    let results;
    if (this.config.task === 'classification') {
      // TODO: change the output format based on the 
      // type of behavior
      results = {
        output: await ys.data(),
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