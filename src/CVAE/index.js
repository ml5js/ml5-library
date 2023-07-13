// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
* CVAE: Run conditional auto-encoder for pro-trained model
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import generatedImageResult from '../utils/generatedImageResult';
import handleArguments from '../utils/handleArguments';
import modelLoader from '../utils/modelLoader';
import { modelInputShape, validateLatentInput } from '../utils/tensorInput';

class Cvae {
  /**
   * Create a Conditional Variational Autoencoder (CVAE).
   * @param {string} modelPath - Required. The url path to your model.
   * @param {ML5Callback<Cvae>} [callback] - Optional. A function to run once the model has been loaded.
   */
  constructor(modelPath, callback) {
    /**
     * @type {null|tf.LayersModel}
     */
    this.model = null;
    /**
     * Promise that resolves when the model has loaded.
     * @type {Promise<Cvae>}
     * @public
     */
    this.ready = callCallback(this.loadCVAEModel(modelPath), callback);
    /**
     * @type {string[]}
     */
    this.labels = [];
  }

  // load tfjs model that is converted by tensorflowjs with graph and weights
  async loadCVAEModel(modelPath) {
    const loader = modelLoader(modelPath, 'manifest');
    const manifest = await loader.loadManifestJson();
    this.labels = manifest.labels;
    this.model = await loader.loadLayersModel(manifest.model);
    return this;
  }

  /**
   * @public
   * Generate a random result.
   * @param {string} label - Required. The label of the feature you want to generate
   * @param {tf.Tensor2D|number[]|Float32Array} [latentVector] - Optional. Can provide a latent vector to use as the
   * input for the model. This should be an array with a length matching the input size specified in the model
   * or a 2D tensor with shape [1, inputSize].
   * If not provided, will use a random vector.
   * @param {function} [callback] - Optional. A function to handle the results of ".generate()".
   *  Likely a function to do something with the generated image data.
   * @return {Promise<{ raw: Uint8ClampedArray, src: string, image?: p5.Image }>}
   */
  async generate(label, latentVector, callback) {
    const args = handleArguments(label, latentVector, callback);
    return callCallback((async () => {
      await this.ready;
      const res = tf.tidy(() => {
        const latentDim = validateLatentInput(this.model, args.array || args.object);
        // TODO: general utility for one-hot encoding
        const labelIndex = this.labels.indexOf(args.string);
        if (labelIndex < 0) {
          throw new Error(`Label '${label}' not found. Label must be one of: ${this.labels.join(', ')}`);
        }
        const labelShape = modelInputShape(this.model, 1);
        // TODO: is the +1 here always correct?
        const input = tf.oneHot(labelIndex + 1, labelShape[1]).reshape(labelShape);
        return this.model.predict([latentDim, input]).squeeze();
      });
      const { raw, image, blob } = await generatedImageResult(res, { returnTensors: false });
      const src = typeof URL !== 'undefined' ? URL.createObjectURL(blob) : undefined;
      // Note: property `raws` is to provide backwards compatibility and should be removed in a future version.
      return { src, raws: raw, raw, image };
    })(), args.callback);
  }
}

// TODO: accept options with `returnTensors`
/**
 * Create a Conditional Variational Autoencoder (CVAE).
 * @param {string} model - Required. The url path to your model.
 * @param {ML5Callback<Cvae>} [callback] - Optional. A function to run once the model has been loaded.
 */
const CVAE = (model, callback) => new Cvae(model, callback);


export default CVAE;
