// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
 * Handpose: Palm detector and hand-skeleton finger tracking in the browser
 * Ported and integrated from all the hard work by: https://github.com/tensorflow/tfjs-models/tree/master/handpose
 */

import * as tf from "@tensorflow/tfjs";
import * as handposeCore from "@tensorflow-models/handpose";
import { EventEmitter } from "events";
import callCallback from "../utils/callcallback";
import handleArguments from "../utils/handleArguments";
import { mediaReady } from '../utils/imageUtilities';

class Handpose extends EventEmitter {
  /**
   * Create Handpose.
   * @param {HTMLVideoElement} [video] - An HTMLVideoElement.
   * @param {object} [options] - An object with options.
   * @param {function} [callback] - A callback to be called when the model is ready.
   */
  constructor(video, options, callback) {
    super();

    this.video = video;
    /**
     * @type {null|handposeCore.HandPose}
     */
    this.model = null;
    this.modelReady = false;
    this.config = options;

    this.ready = callCallback(this.loadModel(), callback);
  }

  /**
   * Load the model and set it to this.model
   * @return {this} the Handpose model.
   */
  async loadModel() {
    this.model = await handposeCore.load(this.config);
    this.modelReady = true;

    if (this.video) {
      this.predict();
    }

    return this;
  }

  /**
   * @return {Promise<handposeCore.AnnotatedPrediction[]>} an array of predictions.
   */
  async predict(inputOr, cb) {
    const { image, callback } = handleArguments(this.video, inputOr, cb);
    if (!image) {
      throw new Error("No input image found.");
    }
    await mediaReady(image, false);
    const { flipHorizontal } = this.config;
    const predictions = await this.model.estimateHands(image, flipHorizontal);
    const result = predictions;
    // Soon, we will remove the 'predict' event and prefer the 'hand' event. During
    // the interim period, we will both events.
    this.emit("predict", result);
    this.emit("hand", result);

    if (this.video) {
      return tf.nextFrame().then(() => this.predict());
    }

    if (typeof callback === "function") {
      callback(result);
    }

    return result;
  }
}

const handpose = (...inputs) => {
  const { video, options = {}, callback } = handleArguments(...inputs);
  const instance = new Handpose(video, options, callback);
  return callback ? instance : instance.ready;
};

export default handpose;
