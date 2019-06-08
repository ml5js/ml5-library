// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Generic NeuralNetwork class
*/

import * as tf from '@tensorflow/tfjs';

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options) {
    // TODO: create the model based on many more options and defaults
    console.log(options);

    const inputUnits = options.input || 2;
    const hiddenUnits = Math.floor(inputUnits / 2) + 1;
    const outputUnits = options.output || 1;

    this.model = tf.sequential();
    const hidden = tf.layers.dense({
      units: hiddenUnits,
      inputShape: [inputUnits],
      activation: 'sigmoid',
    });
    const output = tf.layers.dense({
      units: outputUnits,
      activation: 'sigmoid',
    });
    this.model.add(hidden);
    this.model.add(output);

    const LEARNING_RATE = 0.25;
    const optimizer = tf.train.sgd(LEARNING_RATE);

    this.model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
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
