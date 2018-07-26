// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image Classifier using pre-trained networks
*/

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import callCallback from '../utils/callcallback';

const DEFAULTS = {
  mobilenet: {
    version: 1,
    alpha: 1.0,
    topk: 3,
  },
};

class ImageClassifier {
  constructor(modelName, video, options, callback) {
    this.modelName = modelName;
    this.video = video;
    this.version = options.version || DEFAULTS[this.modelName].version;
    this.alpha = options.alpha || DEFAULTS[this.modelName].alpha;
    this.topk = options.topk || DEFAULTS[this.modelName].topk;
    this.model = null;
    if (this.modelName === 'mobilenet') {
      this.modelToUse = mobilenet;
    } else {
      this.modelToUse = null;
    }
    // Load the model
    this.ready = callCallback(this.loadModel(), callback);
  }

  async loadModel() {
    this.model = await this.modelToUse.load(this.version, this.alpha);
    return this;
  }

  async predictInternal(imgToPredict, numberOfClasses) {
    // Wait for the model to be ready
    await this.ready;
    await tf.nextFrame();

    if (this.video && this.video.readyState === 0) {
      await new Promise((resolve) => {
        this.video.onloadeddata = () => resolve();
      });
    }
    return this.model.classify(imgToPredict, numberOfClasses);
  }

  async predict(inputNumOrCallback, numOrCallback = null, cb) {
    let imgToPredict = this.video;
    let numberOfClasses = this.topk;
    let callback;

    // Handle the image to predict
    if (typeof inputNumOrCallback === 'function') {
      imgToPredict = this.video;
      callback = inputNumOrCallback;
    } else if (typeof inputNumOrCallback === 'number') {
      imgToPredict = this.video;
      numberOfClasses = inputNumOrCallback;
    } else if (inputNumOrCallback instanceof HTMLImageElement) {
      imgToPredict = inputNumOrCallback;
    } else if (typeof inputNumOrCallback === 'object' && inputNumOrCallback.elt instanceof HTMLImageElement) {
      imgToPredict = inputNumOrCallback.elt; // Handle p5.js image
    }

    if (typeof numOrCallback === 'number') {
      numberOfClasses = numOrCallback;
    } else if (typeof numOrCallback === 'function') {
      callback = numOrCallback;
    }

    if (typeof cb === 'function') {
      callback = cb;
    }

    return callCallback(this.predictInternal(imgToPredict, numberOfClasses), callback);
  }

  getFeatures(input) {
    let inputImg;

    if (input instanceof HTMLImageElement ||
      input instanceof HTMLVideoElement ||
      input instanceof HTMLCanvasElement ||
      input instanceof ImageData
    ) {
      inputImg = input;
    } else if (typeof input === 'object' &&
      (input.elt instanceof HTMLImageElement ||
        input.elt instanceof HTMLVideoElement)) {
      inputImg = input.elt; // p5.js image/video element
    }

    return this.model.infer(inputImg, 'conv_preds');
  }
}

const imageClassifier = (modelName, videoOrOptionsOrCallback, optionsOrCallback, cb) => {
  let model;
  let video;
  let options = {};
  let callback = cb;

  if (typeof modelName === 'string') {
    model = modelName.toLowerCase();
  } else {
    throw new Error('Please specify a model to use. E.g: "MobileNet"');
  }

  if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'object' && videoOrOptionsOrCallback.elt instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback.elt; // Handle a p5.js video element
  } else if (typeof videoOrOptionsOrCallback === 'object') {
    options = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'function') {
    callback = videoOrOptionsOrCallback;
  }

  if (typeof optionsOrCallback === 'object') {
    options = optionsOrCallback;
  } else if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback;
  }

  const instance = new ImageClassifier(model, video, options, callback);
  return callback ? instance : instance.ready;
};

export default imageClassifier;
