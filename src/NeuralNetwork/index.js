// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Generic NeuralNetwork class
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
// import {
//   saveBlob
// } from '../utils/io';
// import { input } from '@tensorflow/tfjs';
import DEFAULTS from './NeuralNetworkDefaults';
import NeuralNetworkData from './NeuralNetworkData';
// import NeuralNetworkVis from './NeuralNetworkVis';

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
      // architecture
      architecture: {
        task: options.task || DEFAULTS.task,
        // array of layers, the last is always the output layer
        layers: [],
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



    // data class
    this.data = new NeuralNetworkData(this.config);
    // check if the model is ready
    this.ready = false;
    // the model
    this.model = null;

    // initialize
    this.init(callback);

    // console.log(typeof callback, typeof tf, typeof callCallback)

  }

  /**
   * Initialize the model creation
   */
  init(callback) {
    // Create the model based on data or the inputs/outputs
    if (this.config.dataOptions.dataUrl !== null) {
      this.ready = this.createModelFromData(callback);
    } else {

      this.data.meta.inputUnits = this.config.dataOptions.inputs;
      this.data.meta.outputUnits = this.config.dataOptions.outputs;

      // convert the input number to an array of keys e.g. [label1, label2, label3]
      this.data.config.dataOptions.inputs = this.data.createNamedIO(this.data.config.dataOptions.inputs, 'input');
      this.data.config.dataOptions.outputs = this.data.createNamedIO(this.data.config.dataOptions.outputs, 'output');

      this.model = this.createModel();
      this.ready = true;
    }
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
    // create the model
    this.model = this.createModel();
  }

  /**
   * ----------------------------------------
   * ----------------------------------------
   * ---------------------------------------- 
   */
  /**
   * Adds an endpoint to call data.addData()
   * @param {*} xs 
   * @param {*} ys 
   */
  addData(xs, ys){
    this.data.addData(xs, ys);
  }

  /**
   * normalize the data.raw
   */
  normalize(){
    this.data.normalize();
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