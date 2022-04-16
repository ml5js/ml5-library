// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint max-len: "off" */
/* eslint no-trailing-spaces: "off" */
/*
Fast Style Transfer
This implementation is heavily based on github.com/reiinakano/fast-style-transfer-deeplearnjs by Reiichiro Nakano.
The original TensorFlow implementation was developed by Logan Engstrom: github.com/lengstrom/fast-style-transfer 
*/

import * as tf from '@tensorflow/tfjs';
import Video from './../utils/Video';
import CheckpointLoader from '../utils/checkpointLoader';
import { array3DToImage } from '../utils/imageUtilities';
import callCallback from '../utils/callcallback';

const IMAGE_SIZE = 200;

const convertCanvasToImage = canvas => {
  return new Promise(resolve => {
    const image = new Image(IMAGE_SIZE, IMAGE_SIZE);
    image.onload = () => resolve(image);
    image.src = canvas.toDataURL();
  });
}

class StyleTransfer extends Video {
  /**
   * Create a new Style Transfer Instance。
   * @param {string} model - The path to Style Transfer model.
   * @param {HTMLVideoElement || p5.Video} video  - Optional. A HTML video element or a p5 video element.
   * @param {function} callback - Optional. A function to be called once the model is loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.
   */
  constructor(model, video, callback) {
    super(video, IMAGE_SIZE);
    /**
     * Boolean value that specifies if the model has loaded.
     * @type {boolean}
     * @public
     */
    this.ready = false;
    /**
     * @private
     * @type {Record<string, tf.Tensor>}
     */
    this.variables = {};
    this.timesScalar = tf.scalar(150);
    this.plusScalar = tf.scalar(255.0 / 2);
    this.epsilonScalar = tf.scalar(1e-3);
    this.video = null;
    this.ready = callCallback(this.load(model), callback);
    // this.then = this.ready.then;
  }

  /**
   * @private
   * @param {string} model
   * @return {Promise<StyleTransfer>}
   */
  async load(model) {
    if (this.videoElt) {
      await this.loadVideo();
    }
    await this.loadCheckpoints(model);
    return this;
  }

  /**
   * @private
   * @param {string} path
   * @return {Promise<void>}
   */
  async loadCheckpoints(path) {
    const checkpointLoader = new CheckpointLoader(path);
    this.variables = await checkpointLoader.getAllVariables();
  }

  /**
   * @private
   * @param {tf.Tensor} input
   * @param {number} id
   * @return {tf.Tensor3D}
   */
  instanceNorm(input, id) {
    return tf.tidy( () => {
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
    });
  }

  /**
   * @private
   * @param {tf.Tensor3D} input
   * @param {number} strides
   * @param {boolean} relu
   * @param {number} id
   * @return {tf.Tensor3D}
   */
  convLayer(input, strides, relu, id) {
    return tf.tidy(() => {
      const y = tf.conv2d(input, this.variables[StyleTransfer.getVariableName(id)], [strides, strides], 'same');
      const y2 = this.instanceNorm(y, id + 1);
      return relu ? tf.relu(y2) : y2;
    });
  }

  /**
   * @private
   * @param {tf.Tensor3D} input
   * @param {number} id
   * @return {tf.Tensor3D}
   */
  residualBlock(input, id) {
    return tf.tidy(() => {
      const conv1 = this.convLayer(input, 1, true, id);
      const conv2 = this.convLayer(conv1, 1, false, id + 3);
      return tf.add(conv2, input);
    })
  }

  /**
   * @param {tf.Tensor3D} input
   * @param {number} numFilters
   * @param {number} strides
   * @param {number} id
   * @return {tf.Tensor3D}
   */
  convTransposeLayer(input, numFilters, strides, id) {
    return tf.tidy(() => {
      const [height, width] = input.shape;
      const newRows = height * strides;
      const newCols = width * strides;
      const newShape = [newRows, newCols, numFilters];
      const y = tf.conv2dTranspose(input, this.variables[StyleTransfer.getVariableName(id)], newShape, [strides, strides], 'same');
      const y2 = this.instanceNorm(y, id + 1);
      const y3 = tf.relu(y2);
      return y3;
    })
  }

  /**
   * @public
   * @param {Image || p5.Image || HTMLVideoElement || p5.Video || function} inputOrCallback  - A HTML video or image element or a p5 image or video element. If no input is provided, the default is to use the video element given in the constructor.
   * @param {function} [cb] - Optional. A function to run once the model has made the transfer. If no callback is provided, it will return a promise that will be resolved once the model has made the transfer.
   */
  async transfer(inputOrCallback, cb) {
    let input;
    let callback = cb;

    if (inputOrCallback instanceof HTMLVideoElement ||
        inputOrCallback instanceof HTMLImageElement ||
        inputOrCallback instanceof ImageData) {
      input = inputOrCallback;
    } else if (inputOrCallback instanceof HTMLCanvasElement) {
      input = await convertCanvasToImage(inputOrCallback);
    } else if (typeof inputOrCallback === 'object' && inputOrCallback.elt instanceof HTMLCanvasElement) {
      input = await convertCanvasToImage(inputOrCallback.elt);
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLVideoElement 
      || inputOrCallback.elt instanceof HTMLImageElement
      || inputOrCallback.elt instanceof ImageData)) {
      input = inputOrCallback.elt;
    } else if (typeof inputOrCallback === 'function') {
      input = this.video;
      callback = inputOrCallback;
    }

    return callCallback(this.transferInternal(input), callback);
  }

  /**
   * @private
   * @param {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} input
   * @return {Promise<HTMLImageElement>}
   */
  async transferInternal(input) {
    const image = tf.browser.fromPixels(input);
    const result = array3DToImage(tf.tidy(() => {
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
    }));
    image.dispose();
    await tf.nextFrame();
    return result;
  }

  /**
   * Dispose of all Tensors in instance properties.
   * @public
   * @return {void}
   */
  dispose() {
    Object.values(this.variables).forEach(variable => variable.dispose());
    this.timesScalar.dispose();
    this.plusScalar.dispose();
    this.epsilonScalar.dispose();
  }

  // Static Methods
  static getVariableName(id) {
    if (id === 0) {
      return 'Variable';
    }
    return `Variable_${id}`;
  }
}

const styleTransfer = (model, videoOrCallback, cb) => {
  const video = videoOrCallback;
  let callback = cb;

  if (typeof videoOrCallback === 'function') {
    callback = videoOrCallback;
  }

  const instance = new StyleTransfer(model, video, callback);
  return callback ? instance : instance.ready;
};

export default styleTransfer;
