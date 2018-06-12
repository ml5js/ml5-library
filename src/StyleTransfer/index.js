// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint max-len: "off" */
/*
Fast Style Transfer
*/

import * as tf from '@tensorflow/tfjs';
import Video from './../utils/Video';
import CheckpointLoader from '../utils/checkpointLoader';
import { array3DToImage } from '../utils/imageUtilities';

const IMAGE_SIZE = 200;

class StyleTransfer extends Video {
  constructor(model, video, callback) {
    super(video, IMAGE_SIZE);
    this.ready = false;
    this.variableDictionary = {};
    this.timesScalar = tf.scalar(150);
    this.plusScalar = tf.scalar(255.0 / 2);
    this.epsilonScalar = tf.scalar(1e-3);
    this.video = null;

    if (this.videoElt) {
      this.loadVideo().then(() => {
        this.videoReady = true;
        this.loadCheckpoints(model).then(() => {
          this.ready = true;
          if (callback) {
            callback();
          }
        });
      });
    } else {
      this.loadCheckpoints(model).then(() => {
        this.ready = true;
        if (callback) {
          callback();
        }
      });
    }
  }

  async loadCheckpoints(path) {
    const checkpointLoader = new CheckpointLoader(path);
    this.variables = await checkpointLoader.getAllVariables();
  }

  instanceNorm(input, id) {
    const [height, width, inDepth] = input.shape;
    const moments = tf.moments(input, [0, 1]);
    const mu = moments.mean;
    const sigmaSq = moments.variance;
    const shift = this.variables[StyleTransfer.getVariableName(id)];
    const scale = this.variables[StyleTransfer.getVariableName(id + 1)];
    const epsilon = this.epsilonScalar;
    const normalized = tf.div(tf.sub(input.asType('float32'), mu), tf.sqrt(tf.add(sigmaSq, epsilon)));
    const shifted = tf.add(tf.mul(scale, normalized), shift);
    return shifted.as3D(height, width, inDepth);
  }

  convLayer(input, strides, relu, id) {
    const y = tf.conv2d(input, this.variables[StyleTransfer.getVariableName(id)], [strides, strides], 'same');
    const y2 = this.instanceNorm(y, id + 1);
    if (relu) {
      return tf.relu(y2);
    }
    return y2;
  }

  residualBlock(input, id) {
    const conv1 = this.convLayer(input, 1, true, id);
    const conv2 = this.convLayer(conv1, 1, false, id + 3);
    return tf.add(conv2, input);
  }

  convTransposeLayer(input, numFilters, strides, id) {
    const [height, width] = input.shape;
    const newRows = height * strides;
    const newCols = width * strides;
    const newShape = [newRows, newCols, numFilters];
    const y = tf.conv2dTranspose(input, this.variables[StyleTransfer.getVariableName(id)], newShape, [strides, strides], 'same');
    const y2 = this.instanceNorm(y, id + 1);
    const y3 = tf.relu(y2);
    return y3;
  }

  async transfer(inputOrCallback, cb = () => {}) {
    let input;
    let callback = cb;

    if (inputOrCallback instanceof HTMLVideoElement || inputOrCallback instanceof HTMLImageElement) {
      input = inputOrCallback;
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLVideoElement || inputOrCallback.elt instanceof HTMLImageElement)) {
      input = inputOrCallback.elt;
    } else if (typeof inputOrCallback === 'function') {
      input = this.video;
      callback = inputOrCallback;
    }

    const image = tf.fromPixels(input);
    const result = tf.tidy(() => {
      const conv1 = this.convLayer(image, 1, true, 0);
      const conv2 = this.convLayer(conv1, 2, true, 3);
      const conv3 = this.convLayer(conv2, 2, true, 6);
      const res1 = this.residualBlock(conv3, 9);
      const res2 = this.residualBlock(res1, 15);
      const res3 = this.residualBlock(res2, 21);
      const res4 = this.residualBlock(res3, 27);
      const res5 = this.residualBlock(res4, 33);
      const convT1 = this.convTransposeLayer(res5, 64, 2, 39);
      const convT2 = this.convTransposeLayer(convT1, 32, 2, 42);
      const convT3 = this.convLayer(convT2, 1, false, 45);
      const outTanh = tf.tanh(convT3);
      const scaled = tf.mul(this.timesScalar, outTanh);
      const shifted = tf.add(this.plusScalar, scaled);
      const clamped = tf.clipByValue(shifted, 0, 255);
      const normalized = tf.div(clamped, tf.scalar(255.0));
      return normalized;
    });
    await tf.nextFrame();
    callback(array3DToImage(result));
  }

  // Static Methods
  static getVariableName(id) {
    if (id === 0) {
      return 'Variable';
    }
    return `Variable_${id}`;
  }
}

const styleTransfer = (model, videoOrCallback, cb = () => {}) => {
  const video = videoOrCallback;
  let callback = cb;

  if (typeof videoOrCallback === 'function') {
    callback = videoOrCallback;
  }

  return new StyleTransfer(model, video, callback);
};

export default styleTransfer;
