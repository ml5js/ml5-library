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
import p5Utils from '../utils/p5Utils';

const URL = 'https://raw.githubusercontent.com/zaidalyafeai/HostedModels/master/unet-128/model.json';
const imageSize = 128;

class UNET extends Video {
  /**
   * Create UNET class. 
   * @param {HTMLVideoElement | HTMLImageElement} video - The video or image to be used for segmentation.
   * @param {Object} options - Optional. A set of options.
   * @param {function} callback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise 
   *    that will be resolved once the model has loaded.
   */
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
    this.model = await tf.loadLayersModel(URL);
    this.modelReady = true;
    return this;
  }

  async segment(inputOrCallback, cb) {
    await this.ready;
    let imgToPredict;
    let callback = cb;

    if (inputOrCallback instanceof HTMLImageElement
      || inputOrCallback instanceof HTMLVideoElement
      || inputOrCallback instanceof ImageData) {
      imgToPredict = inputOrCallback;
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement 
      || inputOrCallback.elt instanceof HTMLVideoElement
      || inputOrCallback.elt instanceof ImageData)) {
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
    // skip asking for next frame if it's not video
    if (imgToPredict instanceof HTMLVideoElement){
      await tf.nextFrame();
    }
    this.isPredicting = true;

    const tensor = tf.tidy(() => {
      // preprocess
      const tfImage = tf.browser.fromPixels(imgToPredict).toFloat();
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
    const raw = await tf.browser.toPixels(tensor);
    let image;

    if (p5Utils.checkP5()) {
        const blob1 = await p5Utils.rawToBlob(raw, imageSize, imageSize);
        const p5Image1 = await p5Utils.blobToP5Image(blob1);
        image = p5Image1;
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
