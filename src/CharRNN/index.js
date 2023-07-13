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
import sampleFromDistribution from "./../utils/sample";
import CheckpointLoader from "../utils/checkpointLoader";
import callCallback from "../utils/callcallback";

const regexCell = /cell_[0-9]|lstm_[0-9]/gi;
const regexWeights = /weights|weight|kernel|kernels|w/gi;
const regexFullyConnected = /softmax/gi;

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
     * @type {Record<string, tf.Tensor>}
     * @public
     */
    this.model = {};
    /**
     * The count of kernels in the model.
     * @type {number}
     */
    this.cellsAmount = 0;
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
     * The vocabulary size (or total number of possible characters).
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
     * Count of total unique characters.
     * @type {number}
     */
    this.vocabSize = 0;
    /**
     * TODO: consider removing as an instance property.
     * @type {Float32Array | Array<number>}
     */
    this.probabilities = [];
    /**
     * TODO: this should not be an instance property.
     * @type {CharRNNOptions}
     */
    this.defaults = {
      seed: "a", // TODO: use no seed by default
      length: 20,
      temperature: 0.5,
      stateful: false,
    };
    /**
     * Promise which resolves when the model has loaded.
     * @type {Promise<CharRNN>}
     * @public
     */
    this.ready = callCallback(this.loadCheckpoints(modelPath), callback);
    // this.then = this.ready.then.bind(this.ready);
  }

  /**
   * @deprecated
   *
   * TODO: remove
   */
  resetState() {
    this.reset();
  }

  /**
   * @private
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

    /**
     * @param {number} i
     * @return {tf.LSTMCellFunc}
     */
    const lstm = i => {
      /**
       * @type {tf.LSTMCellFunc}
       */
      const cell = (DATA, C, H) =>
        tf.basicLSTMCell(
          1.0,
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

    // copy new zeroState to state.
    this.reset();
  }

  /**
   * @private
   * Common logic from feed() and generateInternal().
   * Updates this.state based on the current character.
   *
   * @param {number} input - character id
   * @return {Promise<void>}
   */
  async nextState(input) {
    const onehotBuffer = await tf.buffer([1, this.vocabSize]);
    const [c, h] = tf.tidy(() => {
      onehotBuffer.set(1.0, 0, input);
      const onehot = onehotBuffer.toTensor();
      const data = this.model.embedding ? tf.matMul(onehot, this.model.embedding) : onehot;
      return tf.multiRNNCell(this.cells, data, this.state.c, this.state.h);
    });
    this.setState({ c, h });
  }

  /**
   * @private
   * Common logic from feed() and generateInternal().
   * Get an array with the probabilities of each character appearing next.
   *
   * @param {number} temperature
   * @return {Promise<Float32Array>}
   */
  async nextChar(temperature) {
    const normalized = tf.tidy(() => {
      const outputH = this.state.h[1];
      const weightedResult = tf.matMul(outputH, this.model.fullyConnectedWeights);
      const logits = tf.add(weightedResult, this.model.fullyConnectedBiases);
      const divided = tf.div(logits, tf.tensor(temperature));
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
   *
   * @param {CharRNNOptions} options
   * @return {Promise<{state: CharRNNState, sample: string}>}
   */
  async generateInternal(options) {
    await this.ready;
    // TODO: implement documented behavior "default seed is a random character from the model"
    const seed = options.seed || this.defaults.seed;
    const length = +options.length || this.defaults.length;
    const temperature = +options.temperature || this.defaults.temperature;
    const stateful = options.stateful || this.defaults.stateful;
    if (!stateful) {
      this.reset();
    }

    const results = [];
    const userInput = Array.from(seed);
    const encodedInput = userInput.map(char => this.vocab[char]);

    let input = encodedInput[0];
    let probabilitiesNormalized = []; // will contain final probabilities (normalized)

    for (let i = 0; i < userInput.length + length + -1; i += 1) {

      await this.nextState(input);

      if (i < userInput.length - 1) {
        input = encodedInput[i + 1];
      } else {
        probabilitiesNormalized = await this.nextChar(temperature);
        input = sampleFromDistribution(probabilitiesNormalized);
        results.push(input);
      }
    }

    const generated = results.map(id => this.findChar(id)).join('');
    this.probabilities = probabilitiesNormalized;
    return {
      sample: generated,
      state: this.state,
    };
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
    return callCallback(this.generateInternal(options), callback);
  }

  // stateful
  /**
   * Predict the next character based on the model's current state.
   * @param {number} temp
   * @param {function} [callback] - Optional. A function to be called when the
   *    model finished adding the seed. If no callback is provided, it will
   *    return a promise that will be resolved once the prediction has been generated.
   * @return {Promise<{sample: string, probabilities: Array<{probability: number, char: string}>}>}
   */
  async predict(temp, callback) {
    const temperature = temp > 0 ? temp : 0.1;
    const probabilitiesNormalized = await this.nextChar(temperature);

    // The index of the predicted char.
    const sample = sampleFromDistribution(probabilitiesNormalized);
    // The character itself.
    const result = this.findChar(sample);
    this.probabilities = probabilitiesNormalized;
    if (callback) {
      // TODO: why call callback here and not at the end of the function?
      // why call with result first and not error first?
      callback(result);
    }
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
        const encoded = this.vocab[char];
        this.nextState(encoded);
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
    [
      Object.values(this.model),
      this.zeroState.c,
      this.zeroState.h,
      this.state.c,
      this.state.h
    ].forEach(array => array.forEach(tensor => tensor.dispose()));
  }
}

const charRNN = (modelPath = "./", callback) => new CharRNN(modelPath, callback);

export default charRNN;
