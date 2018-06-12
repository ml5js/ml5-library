// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
PoseNet
*/

import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

const DEFAULTS = {
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: false,
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'multiple',
  multiplier: 0.75,
};

class PoseNet {
  constructor(video, options, detectionType, callback) {
    this.video = video;
    this.detectionType = detectionType || DEFAULTS.detectionType;
    this.imageScaleFactor = options.imageScaleFactor || DEFAULTS.imageScaleFactor;
    this.outputStride = options.outputStride || DEFAULTS.outputStride;
    this.flipHorizontal = options.flipHorizontal || DEFAULTS.flipHorizontal;
    this.minConfidence = options.minConfidence || DEFAULTS.minConfidence;
    this.multiplier = options.multiplier || DEFAULTS.multiplier;

    posenet.load(this.multiplier)
      .then((net) => {
        this.net = net;
        if (this.video) {
          (this.video.onplay = () => {
            if (this.detectionType === 'single') {
              this.singlePose(callback);
            } else if (this.detectionType === 'multiple') {
              this.multiPose(callback);
            }
          })();
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
    let callback = cb;

    if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
      input = inputOrCallback;
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement || inputOrCallback.elt instanceof HTMLVideoElement)) {
      input = inputOrCallback.elt; // Handle p5.js image and video
    } else if (typeof inputOrCallback === 'function' && this.video) {
      input = this.video;
      callback = inputOrCallback;
    }

    this.net.estimateSinglePose(input, this.imageScaleFactor, this.flipHorizontal, this.outputStride)
      .then((pose) => {
        callback([{ pose, skeleton: this.skeleton(pose.keypoints) }]);
        tf.nextFrame().then(() => { this.singlePose(callback); });
      });
  }

  multiPose(inputOrCallback, cb = () => {}) {
    let input;
    let callback = cb;

    if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
      input = inputOrCallback;
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement || inputOrCallback.elt instanceof HTMLVideoElement)) {
      input = inputOrCallback.elt; // Handle p5.js image and video
    } else if (typeof inputOrCallback === 'function' && this.video) {
      input = this.video;
      callback = inputOrCallback;
    }

    this.net.estimateMultiplePoses(input, this.imageScaleFactor, this.flipHorizontal, this.outputStride)
      .then((poses) => {
        const result = poses.map(pose => ({ pose, skeleton: this.skeleton(pose.keypoints) }));
        callback(result);
        tf.nextFrame().then(() => { this.multiPose(callback); });
      });
  }
}

const poseNet = (videoOrOptionsOrCallback, optionsOrCallback, cb = () => {}) => {
  let video;
  let options = {};
  let callback = cb;
  let detectionType = null;

  if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'object' && videoOrOptionsOrCallback.elt instanceof HTMLVideoElement) {
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
  } else if (typeof optionsOrCallback === 'string') {
    detectionType = optionsOrCallback;
  }

  return new PoseNet(video, options, detectionType, callback);
};

export default poseNet;
