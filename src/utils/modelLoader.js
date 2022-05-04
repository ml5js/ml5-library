import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

/**
 * Check if the provided URL string starts with a hostname,
 * such as http://, https://, etc.
 * @param {string} str
 * @returns {boolean}
 */
export function isAbsoluteURL(str) {
  const pattern = new RegExp('^(?:[a-z]+:)?//', 'i');
  return pattern.test(str);
}

/**
 * Accepts a URL that may be a complete URL, or a relative location.
 * Returns an absolute URL based on the current window location.
 * @param {string} absoluteOrRelativeUrl
 * @returns {string}
 */
export function getModelPath(absoluteOrRelativeUrl) {
  if (!isAbsoluteURL(absoluteOrRelativeUrl) && typeof window !== 'undefined') {
    return window.location.pathname + absoluteOrRelativeUrl;
  }
  return absoluteOrRelativeUrl;
}

function isKnownName(name) {
  return ['model', 'manifest', 'metadata'].includes(name);
}

/**
 * @property {string} directory
 * @property {string} modelUrl
 * @property {string} manifestUrl
 * @property {string} metadataUrl
 */
class ModelLoader {
  /**
   * Can provide the url to a model.json/metadata.json/manifest.json file,
   * or to a folder containing the files.
   *
   * @param {string} path
   * @param {'model'|'manifest'|'metadata'} expected
   * @param {boolean} prepend
   */
  constructor(path, expected = 'model', prepend = true) {
    const url = prepend ? getModelPath(path) : path;
    const known = {};
    // If a specific URL is provided, make sure that we don't overwrite it with generic '/model.json'
    // But warn the user and try to correct if it seems like they passed the wrong file type.
    if (url.endsWith('.json')) {
      const pos = url.lastIndexOf('/') + 1;
      this.directory = url.slice(0, pos);
      const fileName = url.slice(pos, -5);
      if (fileName !== expected && isKnownName(fileName)) {
        console.warn(`Expected a ${expected}.json file URL, but received a ${fileName}.json file instead.`);
      } else {
        known[expected] = url;
      }
    } else {
      this.directory = url.endsWith('/') ? url : `${url}/`;
    }
    this.modelUrl = known.model || this.getPath('model.json');
    this.metadataUrl = known.metadata || this.getPath('metadata.json');
    this.manifestUrl = known.manifest || this.getPath('manifest.json');
  }

  /**
   * Appends the filename to the base directory.
   * @param {string} filename
   * @return {string}
   */
  getPath(filename) {
    return isAbsoluteURL(filename) ? filename : this.directory + filename;
  }

  /**
   * Fetch the JSON data from the manifest file, and throw an error if not found.
   * @return {Promise<any>}
   */
  async loadManifestJson() {
    try {
      const res = await axios.get(this.manifestUrl);
      return res.data;
    } catch (error) {
      throw new Error(`Error loading manifest.json file from URL ${this.manifestUrl}: ${String(error)}`);
    }
  }

  /**
   * Fetch the JSON data from the metadata file, and throw an error if not found.
   * @return {Promise<any>}
   */
  async loadMetadataJson() {
    try {
      const res = await axios.get(this.metadataUrl);
      return res.data;
    } catch (error) {
      throw new Error(`Error loading metadata.json file from URL ${this.metadataUrl}: ${String(error)}`);
    }
  }

  /**
   * Pass the model URL to the TensorFlow loadLayersModel function.
   * If no path is provided, loads file `/model.json` relative to the directory.
   * But can also be called with the model url from a manifest file.
   * @param {string} [relativePath]
   * @return {Promise<tf.LayersModel>}
   */
  async loadLayersModel(relativePath) {
    const url = relativePath ? this.getPath(relativePath) : this.modelUrl;
    try {
      return await tf.loadLayersModel(url);
    } catch (error) {
      throw new Error(`Error loading model from URL ${url}: ${String(error)}`);
    }
  }
}

/**
 * @param {string} path
 * @param {'model'|'manifest'|'metadata'} [expected]
 * @param {boolean} [prepend]
 * @return {ModelLoader}
 */
export default function modelLoader(path, expected, prepend) {
  return new ModelLoader(path, expected, prepend);
}
