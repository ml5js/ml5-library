// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
PoseNet
The original PoseNet model was ported to TensorFlow.js by Dan Oved.
*/

import EventEmitter from 'events';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import callCallback from '../utils/callcallback';
import handleArguments from "../utils/handleArguments";


const DEFAULTS = {
  architecture: 'MobileNetV1', // 'MobileNetV1', 'ResNet50'
  outputStride: 16, // 8, 16, 32
  flipHorizontal: false, // true, false
  minConfidence: 0.5, 
  maxPoseDetections: 5, // any number > 1
  scoreThreshold: 0.5, 
  nmsRadius: 20, // any number > 0
  detectionType: 'multiple', // 'single'
  inputResolution: 256, // or { width: 257, height: 200 }
  multiplier: 0.75, // 1.01, 1.0, 0.75, or 0.50 -- only for MobileNet
  quantBytes: 2, // 4, 2, 1
  modelUrl: null, // url path to model
};

class PoseNet extends EventEmitter {
  /**
   * @typedef {Object} options
   * @property {string} architecture - default 'MobileNetV1',
   * @property {number} inputResolution - default 257,
   * @property {number} outputStride - default 16
   * @property {boolean} flipHorizontal - default false
   * @property {number} minConfidence - default 0.5
   * @property {number} maxPoseDetections - default 5
   * @property {number} scoreThreshold - default 0.5
   * @property {number} nmsRadius - default 20
   * @property {String} detectionType - default single
   * @property {number} nmsRadius - default 0.75,
   * @property {number} quantBytes - default 2,
   * @property {string} modelUrl - default null
   */
  /**
   * Create a PoseNet model.
   * @param {HTMLVideoElement || p5.Video} video  - Optional. A HTML video element or a p5 video element.
   * @param {options} options - Optional. An object describing a model accuracy and performance.
   * @param {String} detectionType - Optional. A String value to run 'single' or 'multiple' estimation.
   * @param {function} callback  Optional. A function to run once the model has been loaded. 
   *    If no callback is provided, it will return a promise that will be resolved once the 
   *    model has loaded.
   */
  constructor(video, options, detectionType, callback) {
    super();
    this.video = video;
    /**
     * The type of detection. 'single' or 'multiple'
     * @type {String}
     * @public
     */
    this.modelUrl = options.modelUrl || null;
    this.architecture = options.architecture || DEFAULTS.architecture;
    this.detectionType = detectionType || options.detectionType || DEFAULTS.detectionType;
    this.outputStride = options.outputStride || DEFAULTS.outputStride;
    this.flipHorizontal = options.flipHorizontal || DEFAULTS.flipHorizontal;
    this.scoreThreshold = options.scoreThreshold || DEFAULTS.scoreThreshold;
    this.minConfidence = options.minConfidence || DEFAULTS.minConfidence;
    this.maxPoseDetections = options.maxPoseDetections || DEFAULTS.maxPoseDetections;
    this.multiplier = options.multiplier || DEFAULTS.multiplier;
    this.inputResolution = options.inputResolution || DEFAULTS.inputResolution;
    this.quantBytes = options.quantBytes || DEFAULTS.quantBytes;
    this.nmsRadius = options.nmsRadius || DEFAULTS.nmsRadius;
    this.ready = callCallback(this.load(), callback);
    // this.then = this.ready.then;
  }

  async load() {
    let modelJson;
    if(this.architecture.toLowerCase() === 'mobilenetv1'){
      modelJson = {
        architecture: this.architecture,
        outputStride: this.outputStride,
        inputResolution: this.inputResolution,
        multiplier: this.multiplier,
        quantBytes: this.quantBytes,
        modelUrl: this.modelUrl
      }
    } else {
      modelJson = {
        architecture: this.architecture,
        outputStride: this.outputStride,
        inputResolution: this.inputResolution,
        quantBytes: this.quantBytes
      }
    }

    this.net = await posenet.load(modelJson);

    if (this.video) {
      if (this.video.readyState === 0) {
        await new Promise((resolve) => {
          this.video.onloadeddata = () => resolve();
        });
      }
      if (this.detectionType === 'single') {
        this.singlePose();
      } else {
        this.multiPose();
      }
    }
    return this;
  }

  skeleton(keypoints, confidence = this.minConfidence) {
    return posenet.getAdjacentKeyPoints(keypoints, confidence);
  }

  // eslint-disable-next-line class-methods-use-this
  mapParts(pose) {
    const newPose = JSON.parse(JSON.stringify(pose));
    newPose.keypoints.forEach((keypoint) => {
      newPose[keypoint.part] = {
        x: keypoint.position.x,
        y: keypoint.position.y,
        confidence: keypoint.score,
      };
    });
    return newPose;
  }

  /**
   * Given an image or video, returns an array of objects containing pose estimations 
   *    using single or multi-pose detection.
   * @param {HTMLVideoElement || p5.Video || function} inputOr 
   * @param {function} cb 
   */
  async singlePose(inputOr, cb) {
    const { image: input, callback } = handleArguments(this.video, inputOr, cb);

    const pose = await this.net.estimateSinglePose(input, {flipHorizontal: this.flipHorizontal});
    const poseWithParts = this.mapParts(pose);
    const result = [{ pose:poseWithParts, skeleton: this.skeleton(pose.keypoints) }];
    this.emit('pose', result);

    if (this.video) {
      return tf.nextFrame().then(() => this.singlePose());
    }

    if (typeof callback === 'function') {
      callback(result);
    }

    return result;
  }
  
  /**
   * Given an image or video, returns an array of objects containing pose 
   *    estimations using single or multi-pose detection.
   * @param {HTMLVideoElement || p5.Video || function} inputOr 
   * @param {function} cb 
   */
  async multiPose(inputOr, cb) {
    const { image: input, callback } = handleArguments(this.video, inputOr, cb);

    const poses = await this.net.estimateMultiplePoses(input, {
      flipHorizontal: this.flipHorizontal,
      maxDetections: this.maxPoseDetections,
      scoreThreshold: this.scoreThreshold,
      nmsRadius: this.nmsRadius
    });

    const posesWithParts = poses.map(pose => (this.mapParts(pose)));
    const result = posesWithParts.map(pose => ({ pose, skeleton: this.skeleton(pose.keypoints) }));
    this.emit('pose', result);
    if (this.video) {
      return tf.nextFrame().then(() => this.multiPose());
    }

    if (typeof callback === 'function') {
      callback(result);
    }

    return result;
  }
}

const poseNet = (...inputs) => {
  const { video, options = {}, callback, string: detectionType } = handleArguments(...inputs);
  return new PoseNet(video, options, detectionType, callback);
};

export default poseNet;
