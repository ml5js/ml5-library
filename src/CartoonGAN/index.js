// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
* CartoonGAN: see details about the [paper](http://openaccess.thecvf.com/content_cvpr_2018/papers/Chen_CartoonGAN_Generative_Adversarial_CVPR_2018_paper.pdf)
*/

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-core/dist/public/chained_ops/register_all_chained_ops';
import callCallback from '../utils/callcallback';
import p5Utils from '../utils/p5Utils';
import {
  isInstanceOfSupportedElement,
  // eslint-disable-next-line no-unused-vars
  imgToTensor
} from '../utils/imageUtilities';

const IMAGE_SIZE = 256;

const modelPath = {
  'hosoda': 'https://raw.githubusercontent.com/leemengtaiwan/tfjs-models/master/cartoongan/tfjs_json_models/hosoda/model.json',
  'miyazaki': 'https://raw.githubusercontent.com/Derek-Wds/training_CartoonGAN/master/tfModels/Miyazaki/model.json'
};

class Cartoon {
  /**
     * Create a CartoonGan model.
     * @param {String} modelIdentifier - Required. The name of pre-inluded model or the url path to your model.
     * @param {function} callback - Required. A function to run once the model has been loaded.
     */
  constructor(options, callback) {
    this.config = {
      modelUrl: options.modelUrl ? options.modelUrl : modelPath.miyazaki,
      returnTensors: options.returnTensors ? options.returnTensors : false,
    }
    this.model = {};
    this.ready = false;
    this.ready = callCallback(this.loadModel(this.config.modelUrl), callback);
  }

  /* load tfjs model that is converted by tensorflowjs with graph and weights */
  async loadModel(modelUrl) {
    this.model = await tf.loadGraphModel(modelUrl);
    return this;
  }


  // todo: add p5 image support as input
  /**
     * generate an img based on input Image.
     * @param {HTMLImageElement | HTMLCanvasElement} src the source img you want to transfer.
     * @param {function} callback
     */
  async generate(inputOrCallback, cb) {

    let imgToPredict;
    let callback = cb;

    if (isInstanceOfSupportedElement(inputOrCallback)) {
      imgToPredict = inputOrCallback;
    } else if (typeof inputOrCallback === "object" && isInstanceOfSupportedElement(inputOrCallback.elt)) {
      imgToPredict = inputOrCallback.elt; // Handle p5.js image and video.
    } else if (typeof inputOrCallback === "object" && isInstanceOfSupportedElement(inputOrCallback.canvas)) {
      imgToPredict = inputOrCallback.canvas; // Handle p5.js image and video.
    } else if (typeof inputOrCallback === "function") {
      imgToPredict = this.video;
      callback = inputOrCallback;
    } else {
      throw new Error('Detection subject not supported');
    }

    return callCallback(this.generateInternal(imgToPredict), callback);
  }

  async generateInternal(src) {
    await this.ready;
    await tf.nextFrame();
    // adds resizeBilinear to resize image to 256x256 as required by the model
    let img = tf.browser.fromPixels(src).resizeBilinear([IMAGE_SIZE,IMAGE_SIZE]);
    if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
      throw new Error(`Input size should be ${IMAGE_SIZE}*${IMAGE_SIZE} but ${img.shape} is found`);
    } else if (img.shape[2] !== 3) {
      throw new Error(`Input color channel number should be 3 but ${img.shape[2]} is found`);
    }
    img = img.sub(127.5).div(127.5).reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
        
    const alpha = tf.ones([IMAGE_SIZE, IMAGE_SIZE, 1]).tile([1, 1, 1]).mul(255)
    let res = this.model.predict(img);
    res = res.add(1).mul(127.5).reshape([IMAGE_SIZE, IMAGE_SIZE, 3]).floor();
    res = res.concat(alpha, 2)
    const result = this.resultFinalize(res);
        
    if(this.config.returnTensors){
      return result;
    }

    img.dispose();
    res.dispose();
    return result;
  }

  /* eslint class-methods-use-this: "off" */
  async resultFinalize(res){
    const tensor = res;
    const raw = await res.data();
    const blob = await p5Utils.rawToBlob(raw, res.shape[0], res.shape[1]);
    const image = await p5Utils.blobToP5Image(blob);
    if(this.config.returnTensors){
      return {tensor, raw, blob, image};
    }
    return {raw, blob, image};
        
  }
} 

const cartoon = (optionsOr, cb) => {
  const options = (typeof optionsOr === 'object') ? optionsOr : {};
  const callback = (typeof optionsOr === 'function') ? optionsOr : cb;

  if(typeof optionsOr === 'string'){
    options.modelUrl = optionsOr;
  }

  return new Cartoon(options, callback);
};


export default cartoon; 
