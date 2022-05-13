// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image Classifier using pre-trained networks
*/

import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import handleArguments from "../utils/handleArguments";
import * as darknet from "./darknet";
import * as doodlenet from "./doodlenet";
import * as modelFromUrl from "./custom";
import callCallback from "../utils/callcallback";
import { imgToTensor } from "../utils/imageUtilities";

const DEFAULTS = {
  mobilenet: {
    version: 2,
    alpha: 1.0
  },
  topk: 3
};
const IMAGE_SIZE = 224;

/**
 * @typedef Classify
 * @param {tf.Tensor3D} img
 * @param {number} classes
 * @return {Promise<Array<{ className: string, probability: number }>>}
 */
/**
 * @typedef {Object} ClassifierModel
 * @property {Classify} classify
 */

class ImageClassifier {
  /**
   * Create an ImageClassifier.
   * @param {string} modelNameOrUrl - The name or the URL of the model to use. Current model name options
   *    are: 'mobilenet', 'darknet', 'darknet-tiny', and 'doodlenet'.
   * @param {HTMLVideoElement} video - An HTMLVideoElement.
   * @param {object} options - An object with options.
   * @param {function} callback - A callback to be called when the model is ready.
   */
  constructor(modelNameOrUrl, video, options, callback) {
    this.video = video;
    /**
     * @type {null|ClassifierModel}
     */
    this.model = null;
    const { topk, ...rest } = options;
    /**
     * @type number
     */
    this.topk = topk;
    // Load the model
    this.ready = callCallback(this.loadModel(modelNameOrUrl, rest), callback);
  }

  /**
   * Load the model and set it to this.model
   * @param {string} modelNameOrUrl
   * @param {object} [options]
   * @return {this} The ImageClassifier.
   */
  async loadModel(modelNameOrUrl, options= {}) {
    switch (modelNameOrUrl.toLowerCase()) {
      case "mobilenet":
        this.model = await mobilenet.load({ ...DEFAULTS.mobilenet, ...options });
        break;
      case "darknet":
        this.model = await darknet.load({ version: "reference" }); // this a 28mb model
        break;
      case "darknet-tiny":
        this.model = await darknet.load({ version: "reference" }); // this a 4mb model
        break;
      case "doodlenet":
        this.model = await doodlenet.load();
        break;
      default:
        this.model = await modelFromUrl.load(modelNameOrUrl);
    }
    return this;
  }

  /**
   * Classifies the given input and returns an object with labels and confidence
   * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} imgToPredict -
   *    takes an image to run the classification on.
   * @param {number} numberOfClasses - a number of labels to return for the image
   *    classification.
   * @return {Promise<{confidence: number, label: string}[]>} an object with {label, confidence}.
   */
  async classifyInternal(imgToPredict, numberOfClasses) {
    // Wait for the model to be ready
    await this.ready;
    await tf.nextFrame();

    if (imgToPredict instanceof HTMLVideoElement && imgToPredict.readyState === 0) {
      const video = imgToPredict;
      // Wait for the video to be ready
      await new Promise(resolve => {
        video.onloadeddata = () => resolve();
      });
    }

    if (this.video && this.video.readyState === 0) {
      await new Promise(resolve => {
        this.video.onloadeddata = () => resolve();
      });
    }

    // Process the images
    const imageResize = [IMAGE_SIZE, IMAGE_SIZE];
    const processedImg = imgToTensor(imgToPredict, imageResize);
    const results = this.model
      .classify(processedImg, numberOfClasses)
      .then(classes => classes.map(c => ({ label: c.className, confidence: c.probability })));

    processedImg.dispose();

    return results;
  }

  /**
   * Classifies the given input and takes a callback to handle the results
   * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} inputNumOrCallback -
   *    takes any of the following params
   * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} numOrCallback -
   *    takes any of the following params
   * @param {function} cb - a callback function that handles the results of the function.
   * @return {function} a promise or the results of a given callback, cb.
   */
  async classify(inputNumOrCallback, numOrCallback, cb) {
    const { image, number, callback } = handleArguments(this.video, inputNumOrCallback, numOrCallback, cb)
      .require('image',
        "No input image provided. If you want to classify a video, pass the video element in the constructor."
      );
    return callCallback(this.classifyInternal(image, number), callback);
  }

  /**
   * Will be deprecated soon in favor of ".classify()" - does the same as .classify()
   * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} inputNumOrCallback - takes any of the following params
   * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} numOrCallback - takes any of the following params
   * @param {function} cb - a callback function that handles the results of the function.
   * @return {function} a promise or the results of a given callback, cb.
   */
  async predict(inputNumOrCallback, numOrCallback, cb) {
    return this.classify(inputNumOrCallback, numOrCallback || null, cb);
  }
}

const imageClassifier = (modelName, videoOrOptionsOrCallback, optionsOrCallback, cb) => {
  const args = handleArguments(modelName, videoOrOptionsOrCallback, optionsOrCallback, cb)
    .require('string', 'Please specify a model to use. E.g: "MobileNet"');

  const { string, video, options = {}, callback } = args;

  const instance = new ImageClassifier(string, video, options, callback);
  return callback ? instance : instance.ready;
};

export default imageClassifier;
