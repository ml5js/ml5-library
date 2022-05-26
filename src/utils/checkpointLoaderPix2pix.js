import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

/**
 * Pix2Pix loads data from a '.pict' file.
 * File contains the properties (name and tensor shape) for each variable
 * and a huge array of numbers for all of the variables.
 * Numbers must be assigned to the correct variable.
 */
export default class CheckpointLoaderPix2pix {
  /**
   * @param {string} urlPath
   */
  constructor(urlPath) {
    /**
     * @type {string}
     */
    this.urlPath = urlPath;
  }

  async getAllVariables() {
    // Load the file as an ArrayBuffer.
    const response = await axios.get(this.urlPath, { responseType: 'arraybuffer' })
      .catch(error => {
        throw new Error(`No model found. Failed with error ${error}`);
      });
    /** @type {ArrayBuffer} */
    const buf = response.data;

    // Break data into three parts: shapes, index, and encoded.
    /** @type {ArrayBuffer[]} */
    const parts = [];
    let offset = 0;
    while (offset < buf.byteLength) {
      const b = new Uint8Array(buf.slice(offset, offset + 4));
      offset += 4;
      const len = (b[0] << 24) + (b[1] << 16) + (b[2] << 8) + b[3]; // eslint-disable-line no-bitwise
      parts.push(buf.slice(offset, offset + len));
      offset += len;
    }

    /** @type {Array<{ name: string, shape: number[] }>} */
    const shapes = JSON.parse((new TextDecoder('utf8')).decode(parts[0]));
    const index = new Float32Array(parts[1]);
    const encoded = new Uint8Array(parts[2]);

    // Dictionary of variables by name.
    /** @type {Record<string, tf.Tensor>} */
    const weights = {};

    // Create a tensor for each shape.
    offset = 0;
    shapes.forEach(({ shape, name }) => {
      const size = shape.reduce((total, num) => total * num);
      // Get the raw data.
      const raw = encoded.slice(offset, offset + size);
      // Decode using index.
      const values = new Float32Array(raw.length);
      raw.forEach((value, i) => {
        values[i] = index[value];
      });
      weights[name] = tf.tensor(values, shape, 'float32');
      offset += size;
    });
    return weights;
  }
}
