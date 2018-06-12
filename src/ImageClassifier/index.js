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
  constructor(modelName, video, options, callback) {
    this.modelName = modelName;
    this.video = video;
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
    /* eslint arrow-body-style: 0 */
    if (this.videoElt && !this.addedListener) {
      /* eslint func-names: 0 */
      this.video.addEventListener('onloadstart', function () {
        return this.model.classify(imgToPredict, numberOfClasses).then((predictions) => {
          if (callback) {
            callback(predictions);
          }
        });
      });
      this.addedListener = true;
    }
    return this.model.classify(imgToPredict, numberOfClasses).then((predictions) => {
      if (callback) {
        callback(predictions);
      }
    });
  }
}

const imageClassifier = (modelName, videoOrOptionsOrCallback, optionsOrCallback, cb = null) => {
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

  return new ImageClassifier(model, video, options, callback);
};

export default imageClassifier;
