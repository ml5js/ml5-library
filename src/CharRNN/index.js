// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
A LSTM Generator: Run inference mode for a pre-trained LSTM.
*/

import * as tf from "@tensorflow/tfjs";
import axios from "axios";
import sampleFromDistribution from "./../utils/sample";
import CheckpointLoader from "../utils/checkpointLoader";
import callCallback from "../utils/callcallback";

const regexCell = /cell_[0-9]|lstm_[0-9]/gi;
const regexWeights = /weights|weight|kernel|kernels|w/gi;
const regexFullyConnected = /softmax/gi;

class CharRNN {
  /**
   * Create a CharRNN.
   * @param {String} modelPath - The path to the trained charRNN model.
   * @param {function} callback  - Optional. A callback to be called once
   *    the model has loaded. If no callback is provided, it will return a
   *    promise that will be resolved once the model has loaded.
   */
  constructor(modelPath, callback) {
    /**
     * Boolean value that specifies if the model has loaded.
     * @type {boolean}
     * @public
     */
    this.ready = false;

    /**
     * The pre-trained charRNN model.
     * @type {model}
     * @public
     */
    this.model = {};
    this.cellsAmount = 0;
    this.cells = [];
    this.zeroState = { c: [], h: [] };
    /**
     * The vocabulary size (or total number of possible characters).
     * @type {c: Array, h: Array}
     * @public
     */
    this.state = { c: [], h: [] };
    this.vocab = {};
    this.vocabSize = 0;
    this.probabilities = [];
    this.defaults = {
      seed: "a", // TODO: use no seed by default
      length: 20,
      temperature: 0.5,
      stateful: false,
    };

    this.ready = callCallback(this.loadCheckpoints(modelPath), callback);
    // this.then = this.ready.then.bind(this.ready);
  }

  resetState() {
    this.state = this.zeroState;
  }

  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  async loadCheckpoints(path) {
    const reader = new CheckpointLoader(path);
    const vars = await reader.getAllVariables();
    Object.keys(vars).forEach(key => {
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
    await this.initCells();
    return this;
  }

  async loadVocab(path) {
    try {
      const { data } = await axios.get(`${path}/vocab.json`);
      this.vocab = data;
      this.vocabSize = Object.keys(data).length;
      return this.vocab;
    } catch (err) {
      return err;
    }
  }

  async initCells() {
    this.cells = [];
    this.zeroState = { c: [], h: [] };
    const forgetBias = tf.tensor(1.0);

    const lstm = i => {
      const cell = (DATA, C, H) =>
        tf.basicLSTMCell(
          forgetBias,
          this.model[`Kernel_${i}`],
          this.model[`Bias_${i}`],
          DATA,
          C,
          H,
        );
      return cell;
    };

    for (let i = 0; i < this.cellsAmount; i += 1) {
      this.zeroState.c.push(tf.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
      this.zeroState.h.push(tf.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
      this.cells.push(lstm(i));
    }

    this.state = this.zeroState;
  }

  async generateInternal(options) {
    await this.ready;
    const seed = options.seed || this.defaults.seed;
    const length = +options.length || this.defaults.length;
    const temperature = +options.temperature || this.defaults.temperature;
    const stateful = options.stateful || this.defaults.stateful;
    if (!stateful) {
      this.state = this.zeroState;
    }

    const results = [];
    const userInput = Array.from(seed);
    const encodedInput = [];

    userInput.forEach(char => {
      encodedInput.push(this.vocab[char]);
    });

    let input = encodedInput[0];
    let probabilitiesNormalized = []; // will contain final probabilities (normalized)

    for (let i = 0; i < userInput.length + length + -1; i += 1) {
      const onehotBuffer = await tf.buffer([1, this.vocabSize]);
      onehotBuffer.set(1.0, 0, input);
      const onehot = onehotBuffer.toTensor();
      let output;
      if (this.model.embedding) {
        const embedded = tf.matMul(onehot, this.model.embedding);
        output = tf.multiRNNCell(this.cells, embedded, this.state.c, this.state.h);
      } else {
        output = tf.multiRNNCell(this.cells, onehot, this.state.c, this.state.h);
      }

      this.state.c = output[0];
      this.state.h = output[1];

      const outputH = this.state.h[1];
      const weightedResult = tf.matMul(outputH, this.model.fullyConnectedWeights);
      const logits = tf.add(weightedResult, this.model.fullyConnectedBiases);
      const divided = tf.div(logits, tf.tensor(temperature));
      const probabilities = tf.exp(divided);
      probabilitiesNormalized = await tf.div(probabilities, tf.sum(probabilities)).data();

      if (i < userInput.length - 1) {
        input = encodedInput[i + 1];
      } else {
        input = sampleFromDistribution(probabilitiesNormalized);
        results.push(input);
      }
    }

    let generated = "";
    results.forEach(char => {
      const mapped = Object.keys(this.vocab).find(key => this.vocab[key] === char);
      if (mapped) {
        generated += mapped;
      }
    });
    this.probabilities = probabilitiesNormalized;
    return {
      sample: generated,
      state: this.state,
    };
  }

  /**
   * Reset the model state.
   */
  reset() {
    this.state = this.zeroState;
  }

  /**
   * @typedef {Object} options
   * @property {String} seed
   * @property {number} length
   * @property {number} temperature
   */

  // stateless
  /**
   * Generates content in a stateless manner, based on some initial text
   *    (known as a "seed"). Returns a string.
   * @param {options} options - An object specifying the input parameters of
   *    seed, length and temperature. Default length is 20, temperature is 0.5
   *    and seed is a random character from the model. The object should look like
   *    this:
   * @param {function} callback - Optional. A function to be called when the model
   *    has generated content. If no callback is provided, it will return a promise
   *    that will be resolved once the model has generated new content.
   */
  async generate(options, callback) {
    this.reset();
    return callCallback(this.generateInternal(options), callback);
  }

  // stateful
  /**
   * Predict the next character based on the model's current state.
   * @param {number} temp
   * @param {function} callback - Optional. A function to be called when the
   *    model finished adding the seed. If no callback is provided, it will
   *    return a promise that will be resolved once the prediction has been generated.
   */
  async predict(temp, callback) {
    let probabilitiesNormalized = [];
    const temperature = temp > 0 ? temp : 0.1;
    const outputH = this.state.h[1];
    const weightedResult = tf.matMul(outputH, this.model.fullyConnectedWeights);
    const logits = tf.add(weightedResult, this.model.fullyConnectedBiases);
    const divided = tf.div(logits, tf.tensor(temperature));
    const probabilities = tf.exp(divided);
    probabilitiesNormalized = await tf.div(probabilities, tf.sum(probabilities)).data();

    const sample = sampleFromDistribution(probabilitiesNormalized);
    const result = Object.keys(this.vocab).find(key => this.vocab[key] === sample);
    this.probabilities = probabilitiesNormalized;
    if (callback) {
      callback(result);
    }
    /* eslint max-len: ["error", { "code": 180 }] */
    const pm = Object.keys(this.vocab).map(c => ({
      char: c,
      probability: this.probabilities[this.vocab[c]],
    }));
    return {
      sample: result,
      probabilities: pm,
    };
  }

  /**
   * Feed a string of characters to the model state.
   * @param {String} inputSeed - A string to feed the charRNN model state.
   * @param {function} callback  - Optional. A function to be called when
   *    the model finished adding the seed. If no callback is provided, it
   *    will return a promise that will be resolved once seed has been fed.
   */
  async feed(inputSeed, callback) {
    await this.ready;
    const seed = Array.from(inputSeed);
    const encodedInput = [];

    seed.forEach(char => {
      encodedInput.push(this.vocab[char]);
    });

    let input = encodedInput[0];
    for (let i = 0; i < seed.length; i += 1) {
      const onehotBuffer = await tf.buffer([1, this.vocabSize]);
      onehotBuffer.set(1.0, 0, input);
      const onehot = onehotBuffer.toTensor();
      let output;
      if (this.model.embedding) {
        const embedded = tf.matMul(onehot, this.model.embedding);
        output = tf.multiRNNCell(this.cells, embedded, this.state.c, this.state.h);
      } else {
        output = tf.multiRNNCell(this.cells, onehot, this.state.c, this.state.h);
      }
      this.state.c = output[0];
      this.state.h = output[1];
      input = encodedInput[i];
    }
    if (callback) {
      callback();
    }
  }
}

const charRNN = (modelPath = "./", callback) => new CharRNN(modelPath, callback);

export default charRNN;
