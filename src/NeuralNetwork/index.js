// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Generic NeuralNetwork class
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import { saveBlob } from '../utils/io';

const DEFAULTS = {
  activation: 'sigmoid',
  debug: true
}

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options) {
    // TODO: create the model based on many more options and defaults

    this.config = {
      debug: options.debug || DEFAULTS.debug,
    }

    const inputUnits = options.input || 2;
    const hiddenUnits = Math.floor(inputUnits / 2) + 1;
    const outputUnits = options.output || 1;
    const activation = options.activation || DEFAULTS.activation;

    this.model = tf.sequential();
    const hidden = tf.layers.dense({
      units: hiddenUnits,
      inputShape: [inputUnits],
      activation,
    });
    const output = tf.layers.dense({
      units: outputUnits,
      activation,
    });
    this.model.add(hidden);
    this.model.add(output);

    const LEARNING_RATE = 0.25;
    const optimizer = tf.train.sgd(LEARNING_RATE);

    this.model.compile({
      optimizer,
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });

    this.training_xs = [];
    this.training_ys = [];
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
          callback(null, { status: 'training', epoch, loss: logs.loss, logs });
        },
        onTrainEnd: () => {
          callback(null, { status: 'complete' });
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

const neuralNetwork = (inputOrOptions, output) => {
  let options;
  if (inputOrOptions instanceof Object) {
    options = inputOrOptions;
  } else {
    options = {
      input: inputOrOptions,
      output,
    };
  }

  const instance = new NeuralNetwork(options);
  return instance;
};

export default neuralNetwork;
