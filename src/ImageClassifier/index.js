// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image classifier class
*/

import * as mobilenet from '@tensorflow-models/mobilenet';
import Video from './../utils/Video';

const IMAGESIZE = 224;
const DEFAULTS = {
  mobilenet: {
    version: 1,
    alpha: 1.0,
    topk: 3,
  },
};

class ImageClassifier extends Video {
  constructor(modelName, videoOrOptionsOrCallback, optionsOrCallback, cb = null) {
    super(videoOrOptionsOrCallback, IMAGESIZE);

    let options = {};
    let callback = cb;
    if (videoOrOptionsOrCallback === 'object') {
      options = videoOrOptionsOrCallback;
    } else if (videoOrOptionsOrCallback === 'function') {
      callback = videoOrOptionsOrCallback;
    }

    if (typeof optionsOrCallback === 'object') {
      options = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    }

    this.modelName = modelName.toLowerCase();
    this.version = options.version || DEFAULTS[this.modelName].version;
    this.alpha = options.alpha || DEFAULTS[this.modelName].alpha;
    this.topk = options.topk || DEFAULTS[this.modelName].topk;
    this.modelLoaded = false;
    this.model = null;
    if (this.modelName === 'mobilenet') {
      this.modelToUse = mobilenet;
    } else {
      this.modelToUse = null;
      console.error('Please specify a model to use. E.g: "Mobilenet"');
    }

    // Load the model and video if necessary
    this.modelLoaded = this.loadModel(callback);
  }

  async loadModel(callback) {
    if (this.videoElt) {
      return this.loadVideo().then(() => {
        this.modelToUse.load().then((model) => {
          this.model = model;
          if (callback) {
            callback();
          }
        });
      });
    }
    return this.modelToUse.load().then((model) => {
      this.model = model;
      if (callback) {
        callback();
      }
    });
  }

  async predict(inputNumOrCallback, numOrCallback = null, cb = null) {
    let imgToPredict;
    let numberOfClasses;
    let callback;

    // Handle the image to predict
    if (typeof inputNumOrCallback === 'function') {
      imgToPredict = this.video;
      callback = inputNumOrCallback;
    } else if (inputNumOrCallback instanceof HTMLImageElement) {
      imgToPredict = inputNumOrCallback;
    } else if (typeof inputNumOrCallback === 'object' && inputNumOrCallback.elt instanceof HTMLImageElement) {
      imgToPredict = inputNumOrCallback.elt; // Handle p5.js image
    } else if (typeof numOrCallback === 'number') {
      imgToPredict = this.video;
      numberOfClasses = inputNumOrCallback;
    }

    // Handle the callback
    if (typeof numOrCallback === 'function') {
      callback = numOrCallback;
    } else if (typeof numOrCallback === 'number') {
      numberOfClasses = numOrCallback;
    } else if (typeof cb === 'function') {
      callback = cb;
    }

    // Wait for the model to be ready
    await this.modelLoaded;

    // Classify the image using the selected model
    return this.model.classify(imgToPredict, numberOfClasses).then((predictions) => {
      if (callback) {
        callback(predictions);
      }
    });
  }
}

export default ImageClassifier;
