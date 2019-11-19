// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
  ObjectDetection
*/

import YOLO from './YOLO/index';
import CocoSsd from './CocoSsd/index';
import {
  isInstanceOfSupportedElement
} from '../utils/imageUtilities';

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
        this.model = new YOLO({
            disableDeprecationNotice: true,
            ...this.options
          },
          callback
        );
        return this;
      case "cocossd":
        this.model = new CocoSsd(this.options, callback);
        return this;
      default:
        // use cocossd as default
        this.model = new CocoSsd(this.options, callback);
        return this;
    }
  }

  /**
   * @typedef {Object} ObjectDetectorPrediction
   * @property {number} x - top left x coordinate of the prediction box (0 to 1).
   * @property {number} y - top left y coordinate of the prediction box (0 to 1).
   * @property {number} w - width of the prediction box (0 to 1).
   * @property {number} h - height of the prediction box (0 to 1).
   * @property {string} label - the label given.
   * @property {number} confidence - the confidence score (0 to 1).
   */
  /**
   * Returns an array of predicted objects
   * @param {function} callback - Optional. A callback that deliver the result. If no callback is
   *                              given, a promise is will be returned.
   * @return {ObjectDetectorPrediction[]} an array of the prediction result
   */
  detect(subject, callback) {
    if (isInstanceOfSupportedElement(subject)) {
      return this.model.detect(subject, callback);
    } else if (typeof subject === "object" && isInstanceOfSupportedElement(subject.elt)) {
      return this.model.detect(subject.elt, callback); // Handle p5.js video and image
    } else if (typeof subject === "object" && isInstanceOfSupportedElement(subject.canvas)) {
      return this.model.detect(subject.canvas, callback); // Handle p5.js video and image
    }
    throw new Error('Detection subject not supported');
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
  return callback ? instance.model : instance.model.ready;

}

export default objectDetector;