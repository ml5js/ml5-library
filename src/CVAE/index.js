// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
* CVAE: Run conditional auto-encoder for pro-trained model
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import generatedImageResult from '../utils/generatedImageResult';
import modelLoader from '../utils/modelLoader';

class Cvae {
  /**
   * Create a Conditional Variational Autoencoder (CVAE).
   * @param {String} modelPath - Required. The url path to your model.
   * @param {function} callback - Required. A function to run once the model has been loaded.
   */
  constructor(modelPath, callback) {
    /**
     * Boolean value that specifies if the model has loaded.
     * @type {boolean}
     * @public
     */
    this.ready = false;
    this.model = {};
    this.latentDim = tf.randomUniform([1, 16]);
    this.ready = callCallback(this.loadCVAEModel(modelPath), callback);
  }
  
  // load tfjs model that is converted by tensorflowjs with graph and weights
  async loadCVAEModel(modelPath) {
    const loader = modelLoader(modelPath, 'manifest');
    const manifest = await loader.loadManifestJson();
    this.labels = manifest.labels;
    // get an array full of zero with the length of labels [0, 0, 0 ...]
    this.labelVector = Array(this.labels.length + 1).fill(0);
    this.model = await loader.loadLayersModel(manifest.model);
    return this;
  }

  /**
   * Generate a random result.
   * @param {String} label  - A label of the feature your want to generate
   * @param {function} callback  - A function to handle the results of ".generate()". Likely a function to do something with the generated image data.
   * @return {Promise<{ raws: Uint8ClampedArray, src: Blob, image: p5.Image }>}
   */
  async generate(label, callback) {
    return callCallback(this.generateInternal(label), callback);
  }

  async generateInternal(label) {
    const res = tf.tidy(() => {
      this.latentDim = tf.randomUniform([1, 16]);
      const cursor = this.labels.indexOf(label);
      if (cursor < 0) {
        console.log('Wrong input of the label!');
        return [undefined, undefined]; // invalid input just return;
      }

      this.labelVector = this.labelVector.map(() => 0); // clear vector
      this.labelVector[cursor+1] = 1;

      const input = tf.tensor([this.labelVector]);

      const temp = this.model.predict([this.latentDim, input]);
      return temp.reshape([temp.shape[1], temp.shape[2], temp.shape[3]]);
    });

    const { raw, image, blob } = await generatedImageResult(res, { returnTensors: false });
    const src = typeof URL !== 'undefined' ? URL.createObjectURL(blob) : undefined;
    return { src, raws: raw, image };
  }

}

const CVAE = (model, callback) => new Cvae(model, callback);


export default CVAE;
