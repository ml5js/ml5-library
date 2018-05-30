// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
A LSTM Generator: Run inference mode for a pre-trained LSTM.
Heavily derived from https://github.com/reiinakano/tfjs-lstm-text-generation/
*/

import * as tf from '@tensorflow/tfjs';

const DEFAULTS = {
  inputLength: 40,
  length: 20,
  temperature: 0.5,
};

class LSTMGenerator {
  constructor(modelPath = './', callback = () => {}) {
    this.modelPath = modelPath;
    this.ready = false;
    this.indices_char = {};
    this.char_indices = {};

    this.loaders = [
      this.loadFile('indices_char'),
      this.loadFile('char_indices'),
    ];

    Promise
      .all(this.loaders)
      .then(() => tf.loadModel(`${this.modelPath}/model.json`))
      .then((model) => { this.model = model; })
      .then(() => callback());
  }

  loadFile(type) {
    fetch(`${this.modelPath}/${type}.json`)
      .then(response => response.json())
      .then((json) => { this[type] = json; })
      .catch(error => console.error(`Error when loading the model ${error}`));
  }

  async generate(options = {}, callback = () => {}) {
    this.length = options.length || DEFAULTS.length;
    this.seed = options.seed || Object.keys(this.char_indices)[Math.floor(Math.random() * Object.keys(this.char_indices).length)];
    this.temperature = options.temperature || DEFAULTS.temperature;
    this.inputLength = options.inputLength || DEFAULTS.inputLength;
    let seed = this.seed;
    let generated = '';

    /* eslint no-loop-func: 0 */
    for (let i = 0; i < this.length; i += 1) {
      const indexTensor = tf.tidy(() => {
        const input = this.convert(seed);
        const prediction = this.model.predict(input).squeeze();
        return LSTMGenerator.sample(prediction, this.temperature);
      });
      const index = await indexTensor.data();
      indexTensor.dispose();
      seed += this.indices_char[index];
      generated += this.indices_char[index];
      await tf.nextFrame();
    }
    callback(generated);
  }

  convert(input) {
    let sentence = input.toLowerCase();
    sentence = sentence.split('').filter(x => x in this.char_indices).join('');
    if (sentence.length < this.inputLength) {
      sentence = sentence.padStart(this.inputLength);
    } else if (sentence.length > this.inputLength) {
      sentence = sentence.substring(sentence.length - this.inputLength);
    }
    const buffer = tf.buffer([1, this.inputLength, Object.keys(this.indices_char).length]);
    for (let i = 0; i < this.inputLength; i += 1) {
      const char = sentence.charAt(i);
      buffer.set(1, 0, i, this.char_indices[char]);
    }
    const result = buffer.toTensor();
    return result;
  }

  static sample(input, temperature) {
    return tf.tidy(() => {
      let prediction = input.log();
      const diversity = tf.scalar(temperature);
      prediction = prediction.div(diversity);
      prediction = prediction.exp();
      prediction = prediction.div(prediction.sum());
      prediction = prediction.mul(tf.randomUniform(prediction.shape));
      return prediction.argMax();
    });
  }
}

export default LSTMGenerator;
