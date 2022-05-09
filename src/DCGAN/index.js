// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
DCGAN
This version is based on alantian's TensorFlow.js implementation: https://github.com/alantian/ganshowcase
*/

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-core/dist/public/chained_ops/register_all_chained_ops';
import axios from 'axios';
import callCallback from '../utils/callcallback';
import  p5Utils from '../utils/p5Utils';

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
    this.modelPathPrefix = '';
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
    const modelInfo = await axios.get(this.modelPath);
    const modelInfoJson = modelInfo.data;

    this.modelInfo = modelInfoJson
        
    const [modelUrl] = this.modelPath.split('manifest.json')
    const modelJsonPath = this.isAbsoluteURL(modelUrl) ? this.modelInfo.model : this.modelPathPrefix + this.modelInfo.model

    this.model = await tf.loadLayersModel(modelJsonPath);
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
        
    const {
      modelLatentDim
    } = this.modelInfo;
    const imageTensor = await this.compute(modelLatentDim, latentVector);

    // get the raw data from tensor
    const raw = await tf.browser.toPixels(imageTensor);
    // get the blob from raw
    const [imgHeight, imgWidth] = imageTensor.shape;
    const blob = await p5Utils.rawToBlob(raw, imgWidth, imgHeight);

    // get the p5.Image object
    let p5Image;
    if (p5Utils.checkP5()) {
      p5Image = await p5Utils.blobToP5Image(blob);
    }

    // wrap up the final js result object
    const result = {};
    result.blob = blob;
    result.raw = raw;
        

    if (p5Utils.checkP5()) {
      result.image = p5Image;
    }

    if(!this.config.returnTensors){
      result.tensor = null;
      imageTensor.dispose();
    } else {
      result.tensor = imageTensor;
    }

    return result;

  }

    
  /* eslint class-methods-use-this: "off" */
  isAbsoluteURL(str) {
    const pattern = new RegExp('^(?:[a-z]+:)?//', 'i');
    return !!pattern.test(str);
  }

}

const DCGAN = (modelPath, optionsOrCb, cb) => {
  let callback;
  let options = {};
  if (typeof modelPath !== 'string') {
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

  if(typeof optionsOrCb === 'function'){
    callback = optionsOrCb;
  } else if (typeof optionsOrCb === 'object'){
    options = optionsOrCb;
    callback = cb;
  }
    

  const instance = new DCGANBase(modelPath, options, callback);
  return callback ? instance : instance.ready;
    
}

export default DCGAN;
