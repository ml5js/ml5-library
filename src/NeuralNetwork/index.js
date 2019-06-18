// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Generic NeuralNetwork class
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options) {
    // TODO: create the model based on many more options and defaults

    const inputUnits = options.input || 2;
    const hiddenUnits = Math.floor(inputUnits / 2) + 1;
    const outputUnits = options.output || 1;
    const activation = options.activation || 'sigmoid';

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

  async predict(input, callback) {
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
