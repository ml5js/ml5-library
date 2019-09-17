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

const DEFAULTS = {
  task: 'regression',
  // activation: 'sigmoid',
  activationHidden: 'sigmoid',
  activationOutput: 'sigmoid',
  debug: true,
  learningRate: 0.25,
  outputUnits: 1,
  hiddenUnits: 1,
  inputUnits: 2,
  modelMetrics: ['accuracy'],
  modelLoss: 'meanSquaredError',
  modelOptimizer: null
}

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options) {
    // TODO: create the model based on many more options and defaults

    this.config = {
      task: options.task || DEFAULTS.task,
      debug: options.debug || DEFAULTS.debug,
      // activation: options.activation || DEFAULTS.activation,
      activationHidden:  options.activationHidden || DEFAULTS.activationHidden,
      activationOutput:  options.activationOutput || DEFAULTS.activationOutput,
      inputUnits: options.inputs || DEFAULTS.inputUnits,
      outputUnits: options.outputs || DEFAULTS.outputUnits,
      hiddenUnits: options.hiddenUnits || DEFAULTS.hiddenUnits,
      learningRate: options.outputs || DEFAULTS.learningRate,
      modelMetrics: options.modelMetrics || DEFAULTS.modelMetrics,
      modelLoss: options.modelLoss || DEFAULTS.modelLoss,
      modelOptimizer: options.modelOptimizer || DEFAULTS.modelOptimizer,
    }

    this.model = this.createModel();

    this.training_xs = [];
    this.training_ys = [];
  }

  createModel() {
    
    switch (this.config.task) {
      case 'regression':
        this.config.modelOptimizer = tf.train.sgd(this.config.learningRate);
        return this.createModelInternal();
      case 'classification':

        // Change the default activations for classifications
        this.config.hiddenUnits = 16;
        this.config.activationHidden = 'softmax' // 'relu', 
        this.config.activationOutput = 'relu' // 'relu', 
        this.config.modelLoss = 'categoricalCrossentropy' 
        this.config.modelOptimizer = tf.train.adam();

        return this.createModelInternal();
      default:
        console.log('no model exists for this type of task yet!');
        return tf.sequential();
    }
  }

  createModelInternal(){
    const model = tf.sequential();
    
    const hidden = tf.layers.dense({
      units: this.config.hiddenUnits,
      inputShape: [this.config.inputUnits],
      activation: this.config.activationHidden,
    });

    // TODO: figure out if we want to add in the ability to add more layers?
    
    const output = tf.layers.dense({
      units: this.config.outputUnits,
      activation: this.config.activationOutput,
    });
    
    model.add(hidden);
    model.add(output);

    model.compile({
      optimizer: this.config.modelOptimizer,
      loss: this.config.modelLoss,
      metrics: this.config.modelMetrics,
    });

    return model;
  }


  addData(xs, ys) {
    this.training_xs.push(xs);
    this.training_ys.push(ys);
  }

  async train(optionsOrEpochs, callback) {
    let options;
    if (optionsOrEpochs instanceof Object) {
      options = optionsOrEpochs;
    } else {
      options = {
        epochs: optionsOrEpochs,
        shuffle: true,
        validationSplit: 0.1,
      };
    }

    const xs = tf.tensor2d(this.training_xs);
    const ys = tf.tensor2d(this.training_ys);
    await this.model.fit(xs, ys, {
      shuffle: options.shuffle,
      validationSplit: options.validationSplit,
      epochs: options.epochs,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          callback(null, {
            status: 'training',
            epoch,
            loss: logs.loss,
            logs
          });
        },
        onTrainEnd: () => {
          callback(null, {
            status: 'complete'
          });
        },
      },
    });
    xs.dispose();
    ys.dispose();
  }

  predict(input, callback) {
    return callCallback(this.predictInternal(input), callback);
  }

  async predictInternal(input) {
    const xs = tf.tensor2d([input]);
    const ys = this.model.predict(xs);
    const results = {
      output: await ys.data(),
      tensor: ys,
    };
    xs.dispose();
    return results;
  }

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

const neuralNetwork = (inputsOrOptions, outputs) => {
  let options;
  if (inputsOrOptions instanceof Object) {
    options = inputsOrOptions;
  } else {
    options = {
      input: inputsOrOptions,
      outputs,
    };
  }

  const instance = new NeuralNetwork(options);
  return instance;
};

export default neuralNetwork;