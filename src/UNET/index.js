// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image Classifier using pre-trained networks
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import generatedImageResult from '../utils/generatedImageResult';

const DEFAULTS = {
  modelPath: 'https://raw.githubusercontent.com/zaidalyafeai/HostedModels/master/unet-128/model.json',
  imageSize: 128,
  returnTensors: false,
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
      imageSize: typeof options.imageSize !== 'undefined' ? options.imageSize : DEFAULTS.imageSize,
      returnTensors: typeof options.returnTensors !== 'undefined' ? options.returnTensors : DEFAULTS.returnTensors,

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

    if (inputOrCallback instanceof HTMLImageElement ||
      inputOrCallback instanceof HTMLVideoElement ||
      inputOrCallback instanceof HTMLCanvasElement ||
      inputOrCallback instanceof ImageData) {
      imgToPredict = inputOrCallback;
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement ||
        inputOrCallback.elt instanceof HTMLVideoElement ||
        inputOrCallback.elt instanceof HTMLCanvasElement ||
        inputOrCallback.elt instanceof ImageData)) {
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
    // skip asking for next frame if it's not video
    if (imgToPredict instanceof HTMLVideoElement) {
      await tf.nextFrame();
    }
    this.isPredicting = true;

    const {
      featureMask,
      backgroundMask,
      segmentation
    } = tf.tidy(() => {
      // preprocess the input image
      const tfImage = tf.browser.fromPixels(imgToPredict).toFloat();
      const resizedImg = tf.image.resizeBilinear(tfImage, [this.config.imageSize, this.config.imageSize]);
      let normTensor = resizedImg.div(tf.scalar(255));
      const batchedImage = normTensor.expandDims(0);
      // get the segmentation
      const pred = this.model.predict(batchedImage);
      
      // add back the alpha channel to the normalized input image
      const alpha = tf.ones([128, 128, 1]).tile([1,1,1])
      normTensor = normTensor.concat(alpha, 2)

      // TODO: optimize these redundancies below, e.g. repetitive squeeze() etc
      // get the background mask;
      let maskBackgroundInternal = pred.squeeze([0]);
      maskBackgroundInternal = maskBackgroundInternal.tile([1, 1, 4]);
      maskBackgroundInternal = maskBackgroundInternal.sub(0.3).sign().relu().neg().add(1);
      const featureMaskInternal = maskBackgroundInternal.mul(normTensor);

      // get the feature mask;
      let maskFeature = pred.squeeze([0]);
      maskFeature = maskFeature.tile([1, 1, 4]);
      maskFeature = maskFeature.sub(0.3).sign().relu();
      const backgroundMaskInternal = maskFeature.mul(normTensor);

      const alpha255 = tf.ones([128, 128, 1]).tile([1,1,1]).mul(255);
      let newpred = pred.squeeze([0]);
      newpred = tf.cast(newpred.tile([1,1,3]).sub(0.3).sign().relu().mul(255), 'int32') 
      newpred = newpred.concat(alpha255, 2)

      return {
        featureMask: featureMaskInternal,
        backgroundMask: backgroundMaskInternal,
        segmentation: newpred
      };
    });

    this.isPredicting = false;

    const maskFeat = await generatedImageResult(featureMask, this.config);
    const maskBg = await generatedImageResult(backgroundMask, this.config);
    const mask = await generatedImageResult(segmentation, this.config);

    return {
      segmentation: mask.raw,
      blob: {
        featureMask: maskFeat.blob,
        backgroundMask: maskBg.blob
      },
      tensor: {
        featureMask: maskFeat.tensor,
        backgroundMask: maskBg.tensor,
      },
      raw: {
        featureMask: maskFeat.raw,
        backgroundMask: maskBg.raw
      },
      // returns if p5 is available
      featureMask: maskFeat.image,
      backgroundMask: maskBg.image,
      mask: mask.image
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
