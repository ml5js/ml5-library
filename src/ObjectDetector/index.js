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
   * @param {string} modelNameOrUrl - The name or the URL of the model to use. Current model name options
   *    are: 'YOLO' and 'CocoSsd'.
   * @param {Object} options - Optional. A set of options.
   * @param {function} callback - Optional. A callback function that is called once the model has loaded.
   */
  constructor(modelNameOrUrl, options, callback) {
    this.modelNameOrUrl = modelNameOrUrl;
    this.options = options || {};
    this.callback = callback;

    switch (modelNameOrUrl) {
      case "YOLO":
        this.model = new YOLO(
          { disableDeprecationNotice: true, ...options },
          callback
        );
        break;
      case "CocoSsd":
        this.model = new CocoSsd(callback);
        break;
      default:
        // Uses custom model url
        this.model = new YOLO(
          {
            disableDeprecationNotice: true,
            modelUrl: modelNameOrUrl,
            ...options
          },
          callback
        );
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
    }
    throw new Error('Detection subject not supported'); 
  }
}

const objectDetector = (modelName, video, options, callback) => {
  return new ObjectDetector(modelName, video, options, callback)
}

export default objectDetector;
