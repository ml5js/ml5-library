// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
  ObjectDetection
*/

import YOLO from './YOLO/index';
import CocoSsd from './CocoSsd/index';
import { isInstanceOfSupportedElement } from '../utils/imageUtilities';

class ObjectDetector {
  /**
   * @typedef {Object} options
   * @property {number} filterBoxesThreshold - Optional. default 0.01
   * @property {number} IOUThreshold - Optional. default 0.4
   * @property {number} classProbThreshold - Optional. default 0.4
   */
  /**
   * Create ObjectDetector model. Works on video and images.
   * @param {string} modelName - The name or the URL of the model to use. Current model name options
   *    are: 'YOLO'.
   * @param {HTMLVideoElement} video - The video to be used for object detection and classification.
   * @param {Object} options - Optional. A set of options.
   * @param {function} callback - Optional. A callback function that is called once the model has loaded.
   *    If no callback is provided, it will return a promise that will be resolved once the model has loaded.
   */
  constructor(modelName, video, options, callback) {
    this.modelName = modelName;
    this.video = video;
    this.options = options || {};
    this.callback = callback;

    if (isInstanceOfSupportedElement(video)) {
      this.video = video;
    } else if (typeof video === 'object' && isInstanceOfSupportedElement(video.elt)) {
      this.video = video.elt; // Handle p5.js video and image
    }

    switch (modelName) {
      case 'YOLO':
        this.model = new YOLO({ disableDeprecationNotice: true, ...options }, callback);
        break;
      case 'CocoSsd':
        this.model = new CocoSsd(options, callback);
        break;
      default:
        throw new Error('Model name not supported')
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
  * Returns an rgb array
  * @param {function} callback - Optional. A callback that deliver the result. If no callback is
  *                              given, a promise is will be returned.
  * @return {ObjectDetectorPrediction[]} an array of the prediction result
  */
  detect(callback) {
    return this.model.detect(this.video, callback);
  }
}

const objectDetector = (modelName, video, options, callback) => {
  return new ObjectDetector(modelName, video, options, callback)
}

export default objectDetector;
