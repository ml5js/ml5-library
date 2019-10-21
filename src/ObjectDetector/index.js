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

    switch (modelName) {
      case 'YOLO':
        options.disableDeprecationNotice = true;
        this.model = new YOLO(video, options, callback);
        break;
      case 'CocoSsd':
        this.model = new CocoSsd(video, options, callback);
        break;
      default:
        throw new Error('Model name not supported')
    }
  }

  detect(callback) {
    this.model.detect(callback);
  }
}

export default ObjectDetector;
