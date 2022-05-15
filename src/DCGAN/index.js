// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
DCGAN
This version is based on alantian's TensorFlow.js implementation: https://github.com/alantian/ganshowcase
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import generatedImageResult from '../utils/generatedImageResult';
import handleArguments from '../utils/handleArguments';
import modelLoader from '../utils/modelLoader';
import { validateLatentInput } from '../utils/tensorInput';

class DCGANBase {
  /**
   * @param {string} modelPath
   * @param {{ returnTensors?: boolean }} [options]
   * @param {ML5Callback<DCGANBase>} [callback]
   */
  constructor(modelPath, options, callback) {
    this.model = {};
    this.modelPath = modelPath;
    this.modelReady = false;
    this.config = {
      returnTensors: options.returnTensors || false,
    }
    this.ready = callCallback(this.loadModel(), callback);
  }

  /**
   * @private
   * Load the model and set it to this.model
   * @return {Promise<DCGANBase>}
   */
  async loadModel() {
    if (this.modelPath.endsWith('manifest.json')) {
      const loader = modelLoader(this.modelPath, 'manifest');
      const manifest = await loader.loadManifestJson();
      this.model = await loader.loadLayersModel(manifest.model);
    } else {
      const loader = modelLoader(this.modelPath, 'model');
      this.model = await loader.loadLayersModel();
    }
    this.modelReady = true;
    return this;
  }

  /**
   * @public
   * Generates a new image
   * @param {tf.Tensor2D|number[]|Float32Array} [latentVector] - Optional. Can provide a latent vector to use as the
   * input for the model. This should be an array with a length matching the `modelLatentDim` specified in the
   * manifest.json or a 2D tensor with shape [1, modelLatentDim].
   * If not provided, will use a random vector.
   * @param {function} [callback] - Optional. A function to handle the results of ".generate()".
   *  Likely a function to do something with the generated image data.
   * @return {Promise<GeneratedImageResult>} - includes blob, raw, and tensor. if P5 exists, then a p5Image
   */
  async generate(latentVector, callback) {
    const args = handleArguments(latentVector, callback);
    return callCallback((async () => {
      await this.ready;
      const input = validateLatentInput(this.model, args.array || args.object);
      const prediction = this.model.predict(input)
        // reshape the tensor
        .squeeze().transpose([1, 2, 0])
        // rescale the values from range [-1 - 1] to range [0 - 1]
        .div(tf.scalar(2)).add(tf.scalar(0.5));
      return generatedImageResult(prediction, this.config);
    })(), args.callback);
  }
}

/**
 * Create an DCGAN.
 * @param {string} modelPath - The URL of the manifest.json or model.json file for the model.
 * @param {{returnTensors?: boolean} | ML5Callback<DCGANBase>} [optionsOrCb] - Optional.
 *  Can provide an options object with property `returnTensors` true/false,
 *  or a callback function to call when the model is ready.
 * @param {ML5Callback<DCGANBase>} [cb] - Optional callback function.
 * @returns {DCGANBase|Promise<DCGANBase>} - If a callback is provided, will return the DCGAN instance.
 *  If no callback, it returns a Promise that resolves to the DCGAN instance after it is ready.
 * @constructor
 */
const DCGAN = (modelPath, optionsOrCb, cb) => {
  const { string, options = {}, callback } = handleArguments(modelPath, optionsOrCb, cb);
  if (!string) {
    throw new Error(`Please specify a path to a "manifest.json" file: \n
         "models/face/manifest.json" \n\n
         This "manifest.json" file should include:\n
         {
            "description": "DCGAN, human faces, 64x64",
            "model": "https://raw.githubusercontent.com/viztopia/ml5dcgan/master/model/model.json",
            "modelSize": 64,
            "modelLatentDim": 128 
         }
         `);
  }

  const instance = new DCGANBase(string, options, callback);
  return callback ? instance : instance.ready;
}

export default DCGAN;
