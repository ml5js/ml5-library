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
import p5Utils from '../utils/p5Utils';

const DEFAULTS = {
  modelPath: 'https://raw.githubusercontent.com/zaidalyafeai/HostedModels/master/unet-128/model.json',
  imageSize: 128
}

class UNET {
  /**
   * Create UNET class. 
   * @param {HTMLVideoElement | HTMLImageElement} video - The video or image to be used for segmentation.
   * @param {Object} options - Optional. A set of options.
   * @param {function} callback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise 
   *    that will be resolved once the model has loaded.
   */
  constructor(video, options, callback) {
    this.modelReady = false;
    this.isPredicting = false;
    this.config = {
      modelPath: typeof options.modelPath !== 'undefined' ? options.modelPath : DEFAULTS.modelPath,
      imageSize: typeof options.imageSize !== 'undefined' ? options.imageSize : DEFAULTS.imageSize
    };
    this.ready = callCallback(this.loadModel(), callback);
  }

  async loadModel() {
    this.model = await tf.loadLayersModel(this.config.modelPath);
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

    const {featureMask, backgroundMask} = tf.tidy(() => {
      // preprocess
      const tfImage = tf.browser.fromPixels(imgToPredict).toFloat();
      const resizedImg = tf.image.resizeBilinear(tfImage, [this.config.imageSize, this.config.imageSize]);
      const normTensor = resizedImg.div(tf.scalar(255));

      const batchedImage = normTensor.expandDims(0);

      const pred = this.model.predict(batchedImage);

      // postprocess
      let maskBackgroundInternal = pred.squeeze([0]);
      maskBackgroundInternal = maskBackgroundInternal.tile([1, 1, 3]);
      maskBackgroundInternal = maskBackgroundInternal.sub(0.3).sign().relu().neg().add(1);
      const featureMaskInternal = maskBackgroundInternal.mul(normTensor);

      let maskFeature = pred.squeeze([0]);
      maskFeature = maskFeature.tile([1, 1, 3]);
      maskFeature = maskFeature.sub(0.3).sign().relu();
      const backgroundMaskInternal = maskFeature.mul(normTensor);
      
      return {featureMask: featureMaskInternal, backgroundMask: backgroundMaskInternal};
    });

    this.isPredicting = false;
    
    const maskFeatDom = array3DToImage(featureMask);
    const maskBgDom = array3DToImage(backgroundMask);
    const maskFeatBlob = UNET.dataURLtoBlob(maskFeatDom.src);
    const maskBgBlob = UNET.dataURLtoBlob(maskBgDom.src);
    const maskFeat = await tf.browser.toPixels(featureMask);
    const maskBg = await tf.browser.toPixels(backgroundMask);

    for(let i = 0; i < maskFeat.length - 4; i+=4){
      const r = maskFeat[i]
      const g = maskFeat[i+1]
      const b = maskFeat[i+2]

      if(r === 0 && g === 0 && b === 0){
        maskFeat[i+3] = 0;
      }

    }

    for(let i = 0; i < maskBg.length - 4; i+=4){
      const r = maskBg[i]
      const g = maskBg[i+1]
      const b = maskBg[i+2]

      if(r === 0 && g === 0 && b === 0){
        maskBg[i+3] = 0;
      }
      
    }
    

    let pFeatureMask;
    let pBgMask;

    if (p5Utils.checkP5()) {
        const blob1 = await p5Utils.rawToBlob(maskFeat, this.config.imageSize, this.config.imageSize);
        const p5Image1 = await p5Utils.blobToP5Image(blob1);
        pFeatureMask = p5Image1;

        const blob2 = await p5Utils.rawToBlob(maskBg, this.config.imageSize, this.config.imageSize);
        const p5Image2 = await p5Utils.blobToP5Image(blob2);
        pBgMask = p5Image2;

    }

    return {
      blob:{
        featureMask: maskFeatBlob,
        backgroundMask: maskBgBlob
      },
      tensor:{
        featureMask,
        backgroundMask,
      },
      raw: {
        featureMask: maskFeat,
        backgroundMask: maskBg
      },
      featureMask: pFeatureMask,
      backgroundMask: pBgMask,
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
