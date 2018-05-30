// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
PoseNet
*/

import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

import ImageAndVideo from './../ImageAndVideo';

const DEFAULTS = {
  imageScaleFactor: 0.5,
  outputStride: 16,
  flipHorizontal: false,
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'single',
};

class PoseNet extends ImageAndVideo {
  constructor(videoOrCallback, optionsOrCallback, cb = () => {}) {
    super(videoOrCallback, 315);
    let options = {};
    let callback = cb;
    this.detectionType = DEFAULTS.detectionType;

    if (typeof videoOrCallback === 'function') {
      callback = videoOrCallback;
    } else if (typeof optionsOrCallback === 'object') {
      options = optionsOrCallback;
      this.detectionType = options.detectionType || DEFAULTS.detectionType;
    } else if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else if (optionsOrCallback === 'multiple') {
      this.detectionType = optionsOrCallback;
    }

    this.imageScaleFactor = options.imageScaleFactor || DEFAULTS.imageScaleFactor;
    this.outputStride = options.outputStride || DEFAULTS.outputStride;
    this.flipHorizontal = options.flipHorizontal || DEFAULTS.flipHorizontal;
    this.minConfidence = options.minConfidence || DEFAULTS.minConfidence;

    // TODO: Specify model
    posenet.load()
      .then((net) => {
        this.net = net;
        if (this.video && callback) {
          if (this.detectionType === 'single') {
            this.singlePose(callback);
          } else if (this.detectionType === 'multiple') {
            this.multiPose(callback);
          }
        }
      })
      .catch((err) => { console.error(`Error loading the model: ${err}`); });
  }

  skeleton(keypoints, confidence = this.minConfidence) {
    return posenet.getAdjacentKeyPoints(keypoints, confidence);
  }

  /* eslint max-len: ["error", { "code": 180 }] */
  singlePose(inputOrCallback, cb = () => {}) {
    let input;
    let callback;

    if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
      input = inputOrCallback;
      callback = cb;
    } else if (typeof inputOrCallback === 'function' && this.video) {
      input = this.video;
      callback = inputOrCallback;
    }

    this.net.estimateSinglePose(input, this.imageScaleFactor, this.flipHorizontal, this.outputStride)
      .then((pose) => {
        callback([pose]);
        tf.nextFrame().then(() => { this.singlePose(callback); });
      });
  }

  multiPose(inputOrCallback, cb = () => {}) {
    let input;
    let callback;

    if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
      input = inputOrCallback;
      callback = cb;
    } else if (typeof inputOrCallback === 'function' && this.video) {
      input = this.video;
      callback = inputOrCallback;
    }

    this.net.estimateMultiplePoses(input, this.imageScaleFactor, this.flipHorizontal, this.outputStride)
      .then((poses) => {
        callback(poses);
        tf.nextFrame().then(() => { this.multiPose(callback); });
      });
  }
}

export default PoseNet;
