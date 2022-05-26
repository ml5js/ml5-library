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

// Default pre-trained face model

// const DEFAULT = {
//     "description": "DCGAN, human faces, 64x64",
//     "model": "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/dcgan/face/model.json",
//     "modelSize": 64,
//     "modelLatentDim": 128
// }

class DCGANBase {
  /**
     * Create an DCGAN.
     * @param {modelName} modelName - The name of the model to use.
     * @param {function} readyCb - A callback to be called when the model is ready.
     */
  constructor(modelPath, options, callback) {
    this.model = {};
    this.modelPath = modelPath;
    this.modelInfo = {};
    this.modelReady = false;
    this.config = {
      returnTensors: options.returnTensors || false,
    }
    this.ready = callCallback(this.loadModel(), callback);
  }

  /**
     * Load the model and set it to this.model
     * @return {this} the dcgan.
     */
  async loadModel() {
    const loader = modelLoader(this.modelPath, 'manifest');
    this.modelInfo = await loader.loadManifestJson();
    this.model = await loader.loadLayersModel(this.modelInfo.model);
    this.modelReady = true;
    return this;
  }

  /**
     * Generates a new image
     * @param {function} callback - a callback function handle the results of generate
     * @param {object} latentVector - an array containing the latent vector; otherwise use random vector
     * @return {object} a promise or the result of the callback function.
     */
  async generate(callback, latentVector) {
    await this.ready;
    return callCallback(this.generateInternal(latentVector), callback);
  }

  /**
     * Computes what will become the image tensor
     * @param {number} latentDim - the number of latent dimensions to pass through
     * @param {object} latentVector - an array containing the latent vector; otherwise use random vector
     * @return {object} a tensor
     */
  async compute(latentDim, latentVector) {
    const y = tf.tidy(() => {
      let z;
      if(Array.isArray(latentVector) === false) {
        z = tf.randomNormal([1, latentDim]);
      }
      else {
        const buffer = tf.buffer([1, latentDim]);
        for(let count = 0; count < latentDim; count+=1) {
          buffer.set(latentVector[count], 0, count);
        }
        z = buffer.toTensor();
      }
      // TBD: should model be a parameter to compute or is it ok to reference this.model here?
      const yDim = this.model.predict(z).squeeze().transpose([1, 2, 0]).div(tf.scalar(2)).add(tf.scalar(0.5));
      return yDim;
    });

    return y;
  }

  /**
     * Takes the tensor from compute() and returns an object of the generate image data
     * @param {object} latentVector - an array containing the latent vector; otherwise use random vector
     * @return {object} includes blob, raw, and tensor. if P5 exists, then a p5Image
     */
  async generateInternal(latentVector) {
    const { modelLatentDim } = this.modelInfo;
    const imageTensor = await this.compute(modelLatentDim, latentVector);
    return generatedImageResult(imageTensor, this.config);
  }

}

const DCGAN = (modelPath, optionsOrCb, cb) => {
  const { string, options = {}, callback } = handleArguments(modelPath, optionsOrCb, cb);
  if (!string) {
    throw new Error(`Please specify a path to a "manifest.json" file: \n
         "models/face/manifest.json" \n\n
         This "manifest.json" file should include:\n
         {
            "description": "DCGAN, human faces, 64x64",
            "model": "https://raw.githubusercontent.com/viztopia/ml5dcgan/master/model/model.json", // "https://github.com/viztopia/ml5dcgan/blob/master/model/model.json",
            "modelSize": 64,
            "modelLatentDim": 128 
         }
         `);
  }

  const instance = new DCGANBase(string, options, callback);
  return callback ? instance : instance.ready;
    
}

export default DCGAN;
