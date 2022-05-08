// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

const MANIFEST_FILE = 'manifest.json';

/**
 * @typedef {Record<string, { filename: string, shape: Array<number> }>} Manifest
 */
/**
 * Loads all of the variables of a model from a directory
 * which contains a `manifest.json` file and individual variable data files.
 * The `manifest.json` contains the `filename` and `shape` for each data file.
 *
 * @class
 * @property {string} urlPath
 * @property {Manifest} [checkpointManifest]
 * @property {Record<string, tf.Tensor>} variables
 */
export default class CheckpointLoader {
  /**
   * @param {string} urlPath - the directory URL
   */
  constructor(urlPath) {
    this.urlPath = urlPath.endsWith('/') ? urlPath : `${urlPath}/`;
    this.variables = {};
  }

  /**
   * @private
   * Executes the request to load the manifest.json file.
   *
   * @return {Promise<Manifest>}
   */
  async loadManifest() {
    try {
      const response = await axios.get(this.urlPath + MANIFEST_FILE);
      return response.data;
    } catch (error) {
      throw new Error(`${MANIFEST_FILE} not found at ${this.urlPath}. ${error}`);
    }
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
      throw new Error(`Cannot load non-existent variable ${varName}`);
    }
    const { filename, shape } = manifest[varName];
    const url = this.urlPath + filename;
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
      this.checkpointManifest = await this.loadManifest();
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
