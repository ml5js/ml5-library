// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image Classifier using pre-trained networks
*/

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const DEFAULTS = {
  mobilenet: {
    version: 1,
    alpha: 1.0,
    topk: 3,
  },
};

class ImageClassifier {
  constructor(modelName, videoOrOptionsOrCallback, optionsOrCallback, cb = null) {
    let options = {};
    let callback = cb;

    if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
      this.video = videoOrOptionsOrCallback;
    } else if (typeof videoOrOptionsOrCallback === 'object' && videoOrOptionsOrCallback.elt instanceof HTMLVideoElement) {
      this.video = videoOrOptionsOrCallback.elt; // Handle a p5.js video element
    } else if (videoOrOptionsOrCallback === 'object') {
      options = videoOrOptionsOrCallback;
    } else if (videoOrOptionsOrCallback === 'function') {
      callback = videoOrOptionsOrCallback;
    }

    if (typeof optionsOrCallback === 'object') {
      options = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    }

    if (typeof modelName === 'string') {
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
      }

      // Load the model
      this.modelLoaded = this.loadModel(callback);
    } else {
      console.error('Please specify a model to use. E.g: "Mobilenet"');
    }
  }

  async loadModel(callback) {
    return this.modelToUse.load(this.version, this.alpha).then((model) => {
      this.model = model;
      if (callback) {
        callback();
      }
    });
  }

  async predict(inputNumOrCallback, numOrCallback = null, cb = null) {
    let imgToPredict;
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
      numberOfClasses = inputNumOrCallback;
    } else if (typeof numOrCallback === 'function') {
      callback = numOrCallback;
    }

    if (typeof cb === 'function') {
      callback = cb;
    }

    // Wait for the model to be ready
    await this.modelLoaded;
    await tf.nextFrame();

    // Classify the image using the selected model
    if (this.video) {
      if (this.video.readyState >= 2) {
        return this.model.classify(imgToPredict, numberOfClasses).then((predictions) => {
          if (callback) {
            callback(predictions);
          }
        });
      }
      if (callback) {
        callback([]);
      }
    }
    return this.model.classify(imgToPredict, numberOfClasses).then((predictions) => {
      if (callback) {
        callback(predictions);
      }
    });
  }
}

export default ImageClassifier;
