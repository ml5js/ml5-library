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
  constructor(video, options, callback) {
    super(video, imageSize);
    this.modelReady = false;
    this.isPredicting = false;
    this.ready = callCallback(this.loadModel(), callback);
  }

  async loadModel() {
    if (this.videoElt && !this.video) {
      this.video = await this.loadVideo();
    }
    this.model = await tf.loadModel(URL);
    this.modelReady = true;
    return this;
  }

  // check if p5js
  static checkP5() {
    if (typeof window !== 'undefined' && window.p5 && window.p5.Image && typeof window.p5.Image === 'function') return true;
    return false;
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

  static dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n) {
      u8arr[n] = bstr.charCodeAt(n);
      n -= 1;
    }
    return new Blob([u8arr], { type: mime });
  }
  async segmentInternal(imgToPredict) {
    // Wait for the model to be ready
    await this.ready;
    await tf.nextFrame();
    this.isPredicting = true;

    const tensor = tf.tidy(() => {
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
    });

    this.isPredicting = false;
    const dom = array3DToImage(tensor);
    const blob = UNET.dataURLtoBlob(dom.src);
    const raw = await tf.toPixels(tensor);
    let image;

    if (UNET.checkP5()) {
      image = window.loadImage(dom.src);
    }

    return {
      blob,
      tensor,
      raw,
      image,
    };
  }
}

const uNet = (videoOr, optionsOr, cb) => {
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
  return new UNET(video, options, callback);
};

export default uNet;
