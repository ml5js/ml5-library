/* eslint max-len: "off" */

import * as tf from '@tensorflow/tfjs';

export default class CheckpointLoaderPix2pix {
  constructor(urlPath) {
    this.urlPath = urlPath;
  }

  getAllVariables() {
    return new Promise((resolve, reject) => {
      const weightsCache = {};
      if (this.urlPath in weightsCache) {
        resolve(weightsCache[this.urlPath]);
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.urlPath, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.status !== 200) {
          reject(new Error('missing model'));
          return;
        }
        const buf = xhr.response;
        if (!buf) {
          reject(new Error('invalid arraybuffer'));
          return;
        }

        const parts = [];
        let offset = 0;
        while (offset < buf.byteLength) {
          const b = new Uint8Array(buf.slice(offset, offset + 4));
          offset += 4;
          const len = (b[0] << 24) + (b[1] << 16) + (b[2] << 8) + b[3]; // eslint-disable-line no-bitwise
          parts.push(buf.slice(offset, offset + len));
          offset += len;
        }

        const shapes = JSON.parse((new TextDecoder('utf8')).decode(parts[0]));
        const index = new Float32Array(parts[1]);
        const encoded = new Uint8Array(parts[2]);

        // decode using index
        const arr = new Float32Array(encoded.length);
        for (let i = 0; i < arr.length; i += 1) {
          arr[i] = index[encoded[i]];
        }

        const weights = {};
        offset = 0;
        for (let i = 0; i < shapes.length; i += 1) {
          const { shape } = shapes[i];
          const size = shape.reduce((total, num) => total * num);
          const values = arr.slice(offset, offset + size);
          const tfarr = tf.tensor1d(values, 'float32');
          weights[shapes[i].name] = tfarr.reshape(shape);
          offset += size;
        }
        weightsCache[this.urlPath] = weights;
        resolve(weights);
      };
      xhr.send(null);
    });
  }
}
