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
import sampleFromDistribution from './../utils/sample';
import CheckpointLoader from '../utils/checkpointLoader';

const regexCell = /cell_[0-9]|lstm_[0-9]/gi;
const regexWeights = /weights|weight|kernel|kernels|w/gi;
const regexFullyConnected = /softmax/gi;

class LSTM {
  constructor(model, callback = () => {}) {
    this.ready = false;
    this.model = {};
    this.cellsAmount = 0;
    this.vocab = {};
    this.vocabSize = 0;
    this.defaults = {
      seed: 'a',
      length: 20,
      temperature: 0.5,
    };
    this.ready = this.loadCheckpoints(model).then(() => {
      callback();
      return this;
    });
  }

  async loadCheckpoints(path, callback = () => {}) {
    const reader = new CheckpointLoader(path);
    const vars = await reader.getAllVariables();
    Object.keys(vars).forEach((key) => {
      if (key.match(regexCell)) {
        if (key.match(regexWeights)) {
          this.model[`Kernel_${key.match(/[0-9]/)[0]}`] = vars[key];
          this.cellsAmount += 1;
        } else {
          this.model[`Bias_${key.match(/[0-9]/)[0]}`] = vars[key];
        }
      } else if (key.match(regexFullyConnected)) {
        if (key.match(regexWeights)) {
          this.model.fullyConnectedWeights = vars[key];
        } else {
          this.model.fullyConnectedBiases = vars[key];
        }
      } else {
        this.model[key] = vars[key];
      }
    });
    await this.loadVocab(path);
    callback();
  }

  async loadVocab(file, callback = () => {}) {
    const json = await fetch(`${file}/vocab.json`)
      .then(response => response.json());
    this.vocab = json;
    this.vocabSize = Object.keys(json).length;
    callback();
  }

  async generate(options, callback = () => {}) {
    const seed = options.seed || this.defaults.seed;
    const length = +options.length || this.defaults.length;
    const temperature = +options.temperature || this.defaults.temperature;
    const results = [];

    await this.ready;
    const forgetBias = tf.tensor(1.0);
    const LSTMCells = [];
    let c = [];
    let h = [];

    const lstm = (i) => {
      const cell = (DATA, C, H) =>
        tf.basicLSTMCell(forgetBias, this.model[`Kernel_${i}`], this.model[`Bias_${i}`], DATA, C, H);
      return cell;
    };

    for (let i = 0; i < this.cellsAmount; i += 1) {
      c.push(tf.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
      h.push(tf.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
      LSTMCells.push(lstm(i));
    }

    const userInput = Array.from(seed);

    const encodedInput = [];
    userInput.forEach((char, ind) => {
      if (ind < 100) {
        encodedInput.push(this.vocab[char]);
      }
    });

    let current = 0;
    let input = encodedInput[current];

    for (let i = 0; i < userInput.length + length; i += 1) {
      const onehotBuffer = tf.buffer([1, this.vocabSize]);
      onehotBuffer.set(1.0, 0, input);
      const onehot = onehotBuffer.toTensor();
      let output;
      if (this.model.embedding) {
        const embedded = tf.matMul(onehot, this.model.embedding);
        output = tf.multiRNNCell(LSTMCells, embedded, c, h);
      } else {
        output = tf.multiRNNCell(LSTMCells, onehot, c, h);
      }

      c = output[0];
      h = output[1];

      const outputH = h[1];
      const weightedResult = tf.matMul(outputH, this.model.fullyConnectedWeights);
      const logits = tf.add(weightedResult, this.model.fullyConnectedBiases);
      const divided = tf.div(logits, tf.tensor(temperature));
      const probabilities = tf.exp(divided);
      const normalized = await tf.div(
        probabilities,
        tf.sum(probabilities),
      ).data();

      const sampledResult = sampleFromDistribution(normalized);
      if (userInput.length > current) {
        input = encodedInput[current];
        current += 1;
      } else {
        input = sampledResult;
        results.push(sampledResult);
      }
    }

    let generated = '';
    results.forEach((char) => {
      const mapped = Object.keys(this.vocab).find(key => this.vocab[key] === char);
      if (mapped) {
        generated += mapped;
      }
    });
    callback({ generated });
    return generated;
  }
}

const LSTMGenerator = (modelPath = './', callback) => {
  const instance = new LSTM(modelPath);
  return callback ? instance : instance.ready;
};

export default LSTMGenerator;
