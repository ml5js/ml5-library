// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
A General Feature Extractor class
*/

const DEFAULTS = {
  mobilenet: {
    version: 1,
    alpha: 1.0,
    topk: 3,
    learningRate: 0.0001,
    hiddenUnits: 100,
    epochs: 20,
    numClasses: 2,
    batchSize: 0.4,
  },
};

class FeatureExtractor {
  constructor(model, inputOrOptionsOrCallback, optionsOrCallback = {}, cb = null) {
    if (typeof model === 'string') {
      this.modelName = model;
    } else {
      console.error('Please specify a model to use. E.g: "Mobilenet"');
    }

    this.options = {};
    let callback = cb;
    // TODO: handle sound inputs
    if (inputOrOptionsOrCallback instanceof HTMLVideoElement) {
      this.input = inputOrOptionsOrCallback;
    } else if (typeof inputOrOptionsOrCallback === 'object' && inputOrOptionsOrCallback.elt instanceof HTMLVideoElement) {
      this.input = inputOrOptionsOrCallback.elt; // Handle p5.js video
    } else if (inputOrOptionsOrCallback === 'object') {
      this.options = inputOrOptionsOrCallback;
    } else if (typeof inputOrOptionsOrCallback === 'function') {
      callback = inputOrOptionsOrCallback;
    }

    if (optionsOrCallback === 'object') {
      this.options = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    }
  }
}

export default FeatureExtractor;
