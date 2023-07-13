// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint no-await-in-loop: "off" */
/*
A LSTM Generator: Run inference mode for a pre-trained LSTM.
*/

import * as tf from "@tensorflow/tfjs";
import axios from "axios";
import callCallback from "../utils/callcallback";
import CheckpointLoader from "../utils/checkpointLoader";
import sampleFromDistribution from "./../utils/sample";

const regexCell = /cell_[0-9]|lstm_[0-9]/gi;
const regexWeights = /weights|weight|kernel|kernels|w/gi;
const regexFullyConnected = /softmax/gi;

/**
 * @typedef {Object} LSTMModel
 * @property {Array<tf.Tensor>} biases - array of bias tensors
 * @property {Array<tf.Tensor>} weights - array of kernel/weight tensors
 * @property {tf.Tensor} fullyConnectedBiases - softmax_b
 * @property {tf.Tensor} fullyConnectedWeights - softmax_w
 * @property {tf.Tensor} [embedding] - optional embedding
 */

/**
 * @type {CharRNNOptions}
 */
const CHAR_RNN_DEFAULTS = {
  seed: ' ',
  length: 20,
  temperature: 0.5,
  stateful: false
};

class CharRNN {
  /**
   * Create a CharRNN.
   * @param {string} modelPath - The path to the trained charRNN model.
   * @param {function} [callback] - Optional. A callback to be called once
   *    the model has loaded. If no callback is provided, it will return a
   *    promise that will be resolved once the model has loaded.
   */
  constructor(modelPath, callback) {
    /**
     * The pre-trained charRNN model.
     * @type {LSTMModel}
     * @public
     */
    this.model = {};
    /**
     * Array of functions which create LSTM cells.
     * @type {Array<tf.LSTMCellFunc>}
     */
    this.cells = [];
    /**
     * @typedef {Object} CharRNNState
     * @property {Array<tf.Tensor2D>} c
     * @property {Array<tf.Tensor2D>} h
     */
    /**
     * @type {CharRNNState}
     */
    this.zeroState = { c: [], h: [] };
    /**
     * @type {CharRNNState}
     * @public
     */
    this.state = { c: [], h: [] };
    /**
     * Mapping of characters to their id numbers.
     * @type {Record<string, number>}
     */
    this.vocab = {};
    /**
     * The vocabulary size (or total number of unique characters).
     * @type {number}
     */
    this.vocabSize = 0;
    /**
     * Promise which resolves when the model has loaded.
     * @type {Promise<CharRNN>}
     * @public
     */
    this.ready = callCallback(this.loadCheckpoints(modelPath), callback);
    // this.then = this.ready.then.bind(this.ready);
  }

  /**
   * @private
   *
   * @param {CharRNNState} state
   * @void
   */
  setState(state) {
    // dispose of previous state, if it is not the same tensors as zeroState.
    if (this.state !== this.zeroState) {
      this.state.c.forEach(tensor => tensor.dispose());
      this.state.h.forEach(tensor => tensor.dispose());
    }
    this.state = state;
  }

  /**
   * @public
   *
   * @return {CharRNNState}
   */
  getState() {
    return this.state;
  }

  /**
   * @private
   *
   * @param {string} path
   * @return {Promise<CharRNN>}
   */
  async loadCheckpoints(path) {
    const reader = new CheckpointLoader(path);
    const vars = await reader.getAllVariables();
    this.model = { biases: [], weights: [] };
    Object.keys(vars).forEach(key => {
      const tensor = vars[key];
      if (key.match(regexCell)) {
        const i = key.match(/[0-9]/)[0];
        if (key.match(regexWeights)) {
          this.model.weights[i] = tensor;
        } else {
          this.model.biases[i] = tensor;
        }
      } else if (key.match(regexFullyConnected)) {
        if (key.match(regexWeights)) {
          this.model.fullyConnectedWeights = tensor;
        } else {
          this.model.fullyConnectedBiases = tensor;
        }
      } else {
        this.model[key] = tensor;
      }
    });
    await this.loadVocab(path);
    await this.initCells();
    return this;
  }

  /**
   * @private
   *
   * @param {string} path
   * @return {Promise<Record<string, number>>}
   */
  async loadVocab(path) {
    try {
      const { data } = await axios.get(`${path}/vocab.json`);
      this.vocab = data;
      this.vocabSize = Object.keys(data).length;
      return this.vocab;
    } catch (err) {
      throw new Error(`Unable to load vocab from URL ${path}/vocab.json. Failed with error: ${err.toString()}`);
    }
  }

  /**
   * @private
   *
   * @return {Promise<void>}
   */
  async initCells() {
    this.cells = [];
    this.zeroState = { c: [], h: [] };

    this.model.biases.forEach((bias, i) => {
      this.zeroState.c.push(tf.zeros([1, bias.shape[0] / 4]));
      this.zeroState.h.push(tf.zeros([1, bias.shape[0] / 4]));
      const kernel = this.model.weights[i];
      this.cells.push(
        (data, c, h) =>
          tf.basicLSTMCell(1.0, kernel, bias, data, c, h)
      );
    })

    // copy new zeroState to state.
    this.reset();
  }

  /**
   * @private
   * Feed in one single character and update this.state.
   *
   * @param {string} character
   * @return {Promise<void>}
   */
  async nextState(character) {
    const encoded = this.vocab[character];
    const onehotBuffer = await tf.buffer([1, this.vocabSize]);
    const [c, h] = tf.tidy(() => {
      onehotBuffer.set(1.0, 0, encoded);
      const onehot = onehotBuffer.toTensor();
      const data = this.model.embedding ? tf.matMul(onehot, this.model.embedding) : onehot;
      return tf.multiRNNCell(this.cells, data, this.state.c, this.state.h);
    });
    this.setState({ c, h });
  }

  /**
   * @private
   * Common logic from feed() and generateInternal().
   * Get an array with the probabilities of each character appearing next
   * and one predicted character.
   *
   * @param {number} temperature
   * @return {Promise<Float32Array>}
   */
  async nextChar(temperature) {
    let temp = temperature;
    if (temperature < 0) {
      temp = CHAR_RNN_DEFAULTS.temperature;
      console.warn(`Temperature should not be less than 0. Replacing provided temperature ${temperature} with default value ${temp}.`);
    }
    const normalized = tf.tidy(() => {
      const outputH = this.state.h[1];
      const weightedResult = tf.matMul(outputH, this.model.fullyConnectedWeights);
      const logits = tf.add(weightedResult, this.model.fullyConnectedBiases);
      const divided = tf.div(logits, tf.tensor(temp));
      const probabilities = tf.exp(divided);
      return tf.div(probabilities, tf.sum(probabilities));
    });
    const probabilitiesNormalized = await normalized.data();
    normalized.dispose();
    return probabilitiesNormalized;
  }


  /**
   * @private
   * Convert a numeric id to its text character.
   *
   * @param {number} index
   * @return {string}
   */
  findChar(index) {
    const result = Object.keys(this.vocab).find(key => this.vocab[key] === index);
    if (!result) {
      throw new Error(`No character in the model's vocab corresponds to predicted index ${index}.`);
    }
    return result;
  }

  /**
   * @private
   * Pick a single character from the model vocab based on the provided probabilities.
   *
   * @param {Float32Array} probabilities
   * @return {string}
   */
  sample(probabilities) {
    // The index of the predicted character.
    const index = sampleFromDistribution(probabilities);
    // The character itself.
    return this.findChar(index);
  }

  /**
   * @public
   * @void
   *
   * Reset the model state.
   */
  reset() {
    this.setState(this.zeroState);
  }

  /**
   * @typedef {Object} CharRNNOptions
   * @property {String} seed
   * @property {number} length
   * @property {number} temperature
   * @property {boolean} stateful
   */

  // stateless
  /**
   * Generates content in a stateless manner, based on some initial text
   *    (known as a "seed"). Returns a string.
   * @param {Partial<CharRNNOptions>} options - An object specifying the input parameters of
   *    seed, length and temperature. Default length is 20, temperature is 0.5
   *    and seed is a random character from the model. The object should look like
   *    this:
   * @param {function} [callback] - Optional. A function to be called when the model
   *    has generated content. If no callback is provided, it will return a promise
   *    that will be resolved once the model has generated new content.
   *
   * @return {Promise<{state: CharRNNState, sample: string}>}
   */
  async generate(options, callback) {
    return callCallback((async () => {
      if (!options) {
        throw new Error('Argument "options" is required.');
      }
      await this.ready;
      const seed = options.seed || CHAR_RNN_DEFAULTS.seed;
      const length = +options.length || CHAR_RNN_DEFAULTS.length;
      const temperature = +options.temperature || CHAR_RNN_DEFAULTS.temperature;
      if (!options.stateful) {
        this.reset();
      }
      await this.feed(seed);
      let generated = '';
      for (let i = 0; i < length; i += 1) {
        const probabilities = await this.nextChar(temperature);
        const char = this.sample(probabilities);
        generated += char;
        await this.nextState(char);
      }
      return {
        sample: generated,
        state: this.state,
      };
    })(), callback);
  }

  // stateful
  /**
   * Predict the next character based on the model's current state.
   * @param {number} temperature
   * @param {function} [callback] - Optional. A function to be called when the
   *    model finished adding the seed. If no callback is provided, it will
   *    return a promise that will be resolved once the prediction has been generated.
   * @return {Promise<{sample: string, probabilities: Array<{probability: number, char: string}>}>}
   */
  async predict(temperature, callback) {
    return callCallback((async () => {
      await this.ready;
      const probabilities = await this.nextChar(temperature);
      const sample = this.sample(probabilities);
      const charProbabilities = Object.keys(this.vocab).map(char => ({
        char,
        probability: probabilities[this.vocab[char]],
      }));
      return {
        sample,
        probabilities: charProbabilities
      };
    })(), callback);
  }

  /**
   * Feed a string of characters to the model state.
   * @param {string} inputSeed - A string to feed the charRNN model state.
   * @param {function} [callback] - Optional. A function to be called when
   *    the model finished adding the seed. If no callback is provided, it
   *    will return a promise that will be resolved once seed has been fed.
   * @return {Promise<void>}
   */
  async feed(inputSeed, callback) {
    return callCallback((async () => {
      await this.ready;
      Array.from(inputSeed).forEach(char => {
        this.nextState(char);
      });
    })(), callback);
  }

  /**
   * @public
   * @void
   *
   * Cleans up memory by disposing of tensors used in instance properties.
   */
  dispose() {
    const tensors = [
      Object.values(this.model),
      this.zeroState.c,
      this.zeroState.h,
      this.state.c,
      this.state.h
    ].flat();
    tensors.forEach(tensor => tensor.dispose());
  }
}

const charRNN = (modelPath = "./", callback) => new CharRNN(modelPath, callback);

export default charRNN;
