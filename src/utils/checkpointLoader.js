// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import modelLoader from './modelLoader';

/**
 * @typedef {Record<string, { filename: string, shape: Array<number> }>} Manifest
 */
/**
 * Loads all of the variables of a model from a directory
 * which contains a `manifest.json` file and individual variable data files.
 * The `manifest.json` contains the `filename` and `shape` for each data file.
 *
 * @class
 *
 * @private - access using `getCheckpointManifest()` instead.
 * @property {Manifest} [checkpointManifest]
 */
export default class CheckpointLoader {
  /**
   * @param {string} urlPath - the directory URL. The URL of the 'manifest.json' file will also work.
   */
  constructor(urlPath) {
    /**
     * @private
     * @type {ModelLoader} loader
     */
    this.loader = modelLoader(urlPath, 'manifest');
    /**
     * @private - access using `getAllVariables()` instead.
     * @type {Record<string, tf.Tensor>} variables
     */
    this.variables = {};
  }

  /**
   * @private
   * Executes the request to load the file for a variable.
   *
   * @param {string} varName
   * @return {Promise<tf.Tensor>}
   */
  async loadVariable(varName) {
    const manifest = await this.getCheckpointManifest();
    if (!(varName in manifest)) {
      throw new Error(`Property ${varName} is missing in manifest.json`);
    }
    const { filename, shape } = manifest[varName];
    const url = this.loader.getPath(filename);
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const values = new Float32Array(response.data);
      return tf.tensor(values, shape);
    } catch (error) {
      throw new Error(`Error loading variable ${varName} from URL ${url}: ${error}`);
    }
  }

  /**
   * @public
   * Lazy-load the contents of the manifest.json file.
   *
   * @return {Promise<Manifest>}
   */
  async getCheckpointManifest() {
    if (!this.checkpointManifest) {
      this.checkpointManifest = await this.loader.loadManifestJson();
    }
    return this.checkpointManifest;
  }

  /**
   * @public
   * Get the property names for each variable in the manifest.
   *
   * @return {Promise<string[]>}
   */
  async getKeys() {
    const manifest = await this.getCheckpointManifest();
    return Object.keys(manifest);
  }

  /**
   * @public
   * Get a dictionary with the tensors for all variables in the manifest.
   *
   * @return {Promise<Record<string, tf.Tensor>>}
   */
  async getAllVariables() {
    // Ensure that all keys are loaded and then return the dictionary.
    const variableNames = await this.getKeys();
    const variablePromises = variableNames.map(v => this.getVariable(v));
    await Promise.all(variablePromises);
    return this.variables;
  }

  /**
   * @public
   * Access a single variable from its key. Will load only if not previously loaded.
   *
   * @param {string} varName
   * @return {Promise<tf.Tensor>}
   */
  async getVariable(varName) {
    if (!this.variables[varName]) {
      this.variables[varName] = await this.loadVariable(varName);
    }
    return this.variables[varName];
  }
}
