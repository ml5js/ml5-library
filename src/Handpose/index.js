// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */

/*
 * Handpose: Palm detector and hand-skeleton finger tracking in the browser
 * Ported and integrated from all the hard work by: https://github.com/tensorflow/tfjs-models/tree/master/handpose
 */

import * as tf from "@tensorflow/tfjs";
import * as handposeCore from "@tensorflow-models/handpose";
import { EventEmitter } from "events";
import callCallback from "../utils/callcallback";
import { isInstanceOfSupportedElement } from "../utils/imageUtilities";

class Handpose extends EventEmitter {
  /**
   * Create Handpose.
   * @param {HTMLVideoElement} video - An HTMLVideoElement.
   * @param {object} options - An object with options.
   * @param {function} callback - A callback to be called when the model is ready.
   */
  constructor(video, options, callback) {
    super();

    this.video = video;
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

    if (this.video && this.video.readyState === 0) {
      await new Promise(resolve => {
        this.video.onloadeddata = () => {
          resolve();
        };
      });
    }

    this.predict();

    return this;
  }

  /**
   * Load the model and set it to this.model
   * @return {this} the Handpose model.
   */
  async predict(inputOr, callback) {
    const input = this.getInput(inputOr);
    if (!input) {
      return [];
    }
    const { flipHorizontal } = this.config;
    const predictions = await this.model.estimateHands(input, flipHorizontal);
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

  getInput(inputOr) {
    let input;
    if (
      isInstanceOfSupportedElement(inputOr)
    ) {
      input = inputOr;
    } else if (
      typeof inputOr === "object" &&
      isInstanceOfSupportedElement(inputOr.elt)
    ) {
      input = inputOr.elt; // Handle p5.js image and video
    } else if (typeof inputOr === "object" && inputOr.canvas instanceof HTMLCanvasElement) {
      input = inputOr.canvas; // Handle p5.js image
    } else {
      input = this.video;
    }

    return input;
  }
}

const handpose = (videoOrOptionsOrCallback, optionsOrCallback, cb) => {
  let video;
  let options = {};
  let callback = cb;

  if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback;
  } else if (
    typeof videoOrOptionsOrCallback === "object" &&
    videoOrOptionsOrCallback.elt instanceof HTMLVideoElement
  ) {
    video = videoOrOptionsOrCallback.elt; // Handle a p5.js video element
  } else if (typeof videoOrOptionsOrCallback === "object") {
    options = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === "function") {
    callback = videoOrOptionsOrCallback;
  }

  if (typeof optionsOrCallback === "object") {
    options = optionsOrCallback;
  } else if (typeof optionsOrCallback === "function") {
    callback = optionsOrCallback;
  }

  const instance = new Handpose(video, options, callback);
  return callback ? instance : instance.ready;
};

export default handpose;
