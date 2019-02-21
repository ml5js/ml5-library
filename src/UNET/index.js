// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image Classifier using pre-trained networks
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import { array3DToImage } from '../utils/imageUtilities';
import Video from '../utils/Video';

const URL = 'https://raw.githubusercontent.com/zaidalyafeai/HostedModels/master/unet-128/model.json';
const imageSize = 128;

class UNET extends Video {
  constructor(modelToUse, video, options, callback) {
    super(video, imageSize);
    this.modelReady = false;
    this.isPredicting = false;

    if (modelToUse !== 'face') {
      throw new Error('Only the face model is available!');
    }
    this.ready = callCallback(this.loadModel(), callback);
    // this.then = this.ready.then;
  }

  async loadModel() {
    if (this.videoElt && !this.video) {
      console.log('waiting for video');
      this.video = await this.loadVideo();
    }
    this.model = await tf.loadModel(URL);
    this.modelReady = true;
    return this;
  }

  async segment(inputOrCallback, cb) {
    await this.ready;
    let imgToPredict;
    let callback = cb;

    if (inputOrCallback instanceof HTMLImageElement
      || inputOrCallback instanceof HTMLVideoElement) {
      imgToPredict = inputOrCallback;
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement || inputOrCallback.elt instanceof HTMLVideoElement)) {
      imgToPredict = inputOrCallback.elt;
    } else if (typeof inputOrCallback === 'function') {
      imgToPredict = this.video;
      callback = inputOrCallback;
    }
    return callCallback(this.segmentInternal(imgToPredict), callback);
  }

  async segmentInternal(imgToPredict) {
    // Wait for the model to be ready
    await this.ready;
    await tf.nextFrame();
    this.isPredicting = true;

    const result = array3DToImage(tf.tidy(() => {
      // preprocess
      const tfImage = tf.fromPixels(imgToPredict).toFloat();
      const resizedImg = tf.image.resizeBilinear(tfImage, [imageSize, imageSize]);
      const normTensor = resizedImg.div(tf.scalar(255));

      const batchedImage = normTensor.expandDims(0);

      const pred = this.model.predict(batchedImage);

      // postprocess
      let mask = pred.squeeze([0]);
      mask = mask.tile([1, 1, 3]);
      mask = mask.sub(0.3).sign().relu();
      const maskedImg = mask.mul(normTensor);
      return maskedImg;
    }));
    this.isPredicting = false;
    return result;
  }
}

const uNet = (modelToUse, videoOr, optionsOr, cb) => {
  let video = null;
  let options = {};
  let callback = cb;

  if (videoOr instanceof HTMLVideoElement) {
    video = videoOr;
  } else if (typeof videoOr === 'object' && videoOr.elt instanceof HTMLVideoElement) {
    video = videoOr.elt; // Handle p5.js image
  } else if (typeof videoOr === 'function') {
    callback = videoOr;
  } else if (typeof videoOr === 'object') {
    options = videoOr;
  }

  if (typeof optionsOr === 'object') {
    options = optionsOr;
  } else if (typeof optionsOr === 'function') {
    callback = optionsOr;
  }
  return new UNET(modelToUse, video, options, callback);
};

export default uNet;
