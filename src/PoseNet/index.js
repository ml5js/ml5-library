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
};

class PoseNet extends ImageAndVideo {
  constructor(video, optionsOrCallback, cb = () => {}) {
    super(video, 315);
    let options = {};
    let callback = cb;
    this.isPredicting = false;
    this.minConfidence = 0.5;

    if (typeof optionsOrCallback === 'object') {
      options = optionsOrCallback;
      callback = cb;
    } else if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    }

    this.imageScaleFactor = options.imageScaleFactor || DEFAULTS.imageScaleFactor;
    this.outputStride = options.outputStride || DEFAULTS.outputStride;
    this.flipHorizontal = options.flipHorizontal || DEFAULTS.flipHorizontal;

    posenet.load()
      .then((net) => {
        this.net = net;
        this.singlePose(callback);
      })
      .catch((err) => { console.error(`Error loading the model: ${err}`); });
  }

  skeleton(keypoints) {
    return posenet.getAdjacentKeyPoints(keypoints, this.minConfidence);
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
        callback(pose);
        tf.nextFrame().then(() => { this.singlePose(callback); });
      });
  }

  // posenet.getAdjacentKeyPoints(keypoints, confidence)

  // multiPose() {

  // }
}

export default PoseNet;
