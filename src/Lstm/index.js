// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
A LSTM Generator: Run inference mode for a pre-trained LSTM.
*/

import * as tf from '@tensorflow/tfjs';

const DEFAULTS = {
  seed: 'a',
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

    // This freezes the browser. See https://github.com/tensorflow/tfjs/issues/245
    tf.loadModel('model/model.json').then((model) => {
      this.model = model;
      console.log('model! loaded!', model);
    });

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

  async generateText(options = {}, callback = () => {}) {
    this.length = options.length || DEFAULTS.length;
    this.seed = options.seed || DEFAULTS.seed;
    this.temperature = options.temperature || DEFAULTS.temperature;
    this.inputLength = options.inputLength || DEFAULTS.inputLength;

    /* eslint no-loop-func: 0 */
    for (let i = 0; i < this.length; i += 1) {
      const indexTensor = tf.tidy(() => {
        const input = LSTMGenerator.convert(this.seed);
        const prediction = this.model.predict(input).squeeze();
        return LSTMGenerator.sample(prediction, this.temperature);
      });
      const index = await indexTensor.data();
      indexTensor.dispose();
      await tf.nextFrame();
      callback(this.indices_char[index]);
    }
  }

  static sample(input, temperature) {
    return tf.tidy(() => {
      let prediction = input.log();
      const diversity = tf.scalar(temperature);
      prediction = prediction.div(diversity);
      prediction = prediction.exp();
      prediction = prediction.div(prediction.sum());
      prediction = prediction.mul(tf.randomNormal(prediction.shape));
      return prediction.argMax();
    });
  }

  static convert(input) {
    let sentence = input.toLowerCase();
    sentence = sentence.split('').filter(x => x in this.char_indices).join('');
    if (sentence.length < this.length) {
      sentence = sentence.padStart(this.length);
    } else if (sentence.length > this.length) {
      sentence = sentence.substring(sentence.length - this.length);
    }
    const buffer = tf.buffer([1, this.inputLength, Object.keys(this.indices_char).length]);
    for (let i = 0; i < this.inputLength; i += 1) {
      const char = sentence.charAt(i);
      buffer.set(1, 0, i, this.char_indices[char]);
    }
    const result = buffer.toTensor();
    return result;
  }
}

export default LSTMGenerator;
