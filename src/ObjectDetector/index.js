// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
  ObjectDetection
*/

import YOLO from './YOLO/index';
import CocoSsd from './CocoSsd/index';

class ObjectDetector {
  /**
   * @typedef {Object} options
   * @property {number} filterBoxesThreshold - Optional. default 0.01
   * @property {number} IOUThreshold - Optional. default 0.4
   * @property {number} classProbThreshold - Optional. default 0.4
   */
  /**
   * Create ObjectDetector model. Works on video and images.
   * @param {string} modelNameOrUrl - The name or the URL of the model to use. Current model name options
   *    are: 'YOLO' and 'CocoSsd'.
   * @param {Object} options - Optional. A set of options.
   * @param {function} callback - Optional. A callback function that is called once the model has loaded.
   */
  constructor(modelNameOrUrl, video, options, callback) {

    this.video = video;
    this.modelNameOrUrl = modelNameOrUrl;
    this.options = options || {};
    this.callback = callback;

    switch (modelNameOrUrl) {
      case "yolo":
        this.model = new YOLO(this.video, { 
          disableDeprecationNotice: true, 
          ...this.options },
          callback
        );
        return this;
      case "cocossd":
        this.model = new CocoSsd(this.video, this.options, callback);
        return this;
      default:
        // use cocossd as default
        this.model = new CocoSsd(this.video, this.options, callback);
        return this;
    }
  }

}

const objectDetector = (modelName, videoOrOptionsOrCallback, optionsOrCallback, cb) => {

  let video;
  let options = {};
  let callback = cb;

  let model = modelName;
  if (typeof model !== 'string') {
    throw new Error('Please specify a model to use. E.g: "YOLO"');
  } else if (model.indexOf('http') === -1) {
    model = modelName.toLowerCase();
  }

  if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback;
  } else if (
    typeof videoOrOptionsOrCallback === 'object' &&
    videoOrOptionsOrCallback.elt instanceof HTMLVideoElement
  ) {
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

  const instance = new ObjectDetector(model, video, options, callback);

  return instance.model.callback ? instance.model : instance.model.ready;

}

export default objectDetector;