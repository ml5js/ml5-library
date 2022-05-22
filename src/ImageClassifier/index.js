// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image Classifier using pre-trained networks
*/

import * as tf from "@tensorflow/tfjs";
// eslint-disable-next-line no-unused-vars
import axios from "axios";
import * as mobilenet from "@tensorflow-models/mobilenet";
import handleArguments from "../utils/handleArguments";
import * as darknet from "./darknet";
import * as doodlenet from "./doodlenet";
import callCallback from "../utils/callcallback";
import { imgToTensor, mediaReady } from "../utils/imageUtilities";

const DEFAULTS = {
  mobilenet: {
    version: 2,
    alpha: 1.0,
    topk: 3,
  },
};
const IMAGE_SIZE = 224;
const MODEL_OPTIONS = ["mobilenet", "darknet", "darknet-tiny", "doodlenet"];

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
    this.model = null;
    this.mapStringToIndex = [];
    if (typeof modelNameOrUrl === "string") {
      if (MODEL_OPTIONS.includes(modelNameOrUrl)) {
        this.modelName = modelNameOrUrl;
        this.modelUrl = null;
        switch (this.modelName) {
          case "mobilenet":
            this.modelToUse = mobilenet;
            this.version = options.version || DEFAULTS.mobilenet.version;
            this.alpha = options.alpha || DEFAULTS.mobilenet.alpha;
            this.topk = options.topk || DEFAULTS.mobilenet.topk;
            break;
          case "darknet":
            this.version = "reference"; // this a 28mb model
            this.modelToUse = darknet;
            break;
          case "darknet-tiny":
            this.version = "tiny"; // this a 4mb model
            this.modelToUse = darknet;
            break;
          case "doodlenet":
            this.modelToUse = doodlenet;
            break;
          default:
            this.modelToUse = null;
        }
      } else {
        // its a url, we expect to find model.json
        this.modelUrl = modelNameOrUrl;
        // The teachablemachine urls end with a slash, so add model.json to complete the full path
        if (this.modelUrl.endsWith('/')) this.modelUrl += "model.json";
      }
    }
    // Load the model
    this.ready = callCallback(this.loadModel(this.modelUrl), callback);
  }

  /**
   * Load the model and set it to this.model
   * @return {this} The ImageClassifier.
   */
  async loadModel(modelUrl) {
    if (modelUrl) this.model = await this.loadModelFrom(modelUrl);
    else this.model = await this.modelToUse.load({ version: this.version, alpha: this.alpha });

    return this;
  }

  async loadModelFrom(path = null) {
    try {
      let data;
      if (path !== null) {
        const result = await axios.get(path);
        // eslint-disable-next-line prefer-destructuring
        data = result.data;
      }

      if (data.ml5Specs) {
        this.mapStringToIndex = data.ml5Specs.mapStringToIndex;
      }
      if (this.mapStringToIndex.length === 0) {
        const split = path.split("/");
        const prefix = split.slice(0, split.length - 1).join("/");
        const metadataUrl = `${prefix}/metadata.json`;

        const metadataResponse = await axios.get(metadataUrl).catch((metadataError) => {
          console.log("Tried to fetch metadata.json, but it seems to be missing.", metadataError);
        });
        if (metadataResponse) {
          const metadata = metadataResponse.data;
          
          if (metadata.labels) {
            this.mapStringToIndex = metadata.labels;
          }
        }
      }
      this.model = await tf.loadLayersModel(path);
      return this.model;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  /**
   * Classifies the given input and returns an object with labels and confidence
   * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} imgToPredict -
   *    takes an image to run the classification on.
   * @param {number} numberOfClasses - a number of labels to return for the image
   *    classification.
   * @return {object} an object with {label, confidence}.
   */
  async classifyInternal(imgToPredict, numberOfClasses) {
    // Wait for the model to be ready
    await this.ready;
    await mediaReady(imgToPredict, true);

    // Process the images
    const imageResize = [IMAGE_SIZE, IMAGE_SIZE];

    if (this.modelUrl) {
      await tf.nextFrame();
      const predictedClasses = tf.tidy(() => {
        const processedImg = imgToTensor(imgToPredict, imageResize);
        const predictions = this.model.predict(processedImg);
        return Array.from(predictions.as1D().dataSync());
      });

      const results = await predictedClasses
        .map((confidence, index) => {
          const label =
            this.mapStringToIndex.length > 0 && this.mapStringToIndex[index]
              ? this.mapStringToIndex[index]
              : index;
          return {
            label,
            confidence,
          };
        })
        .sort((a, b) => b.confidence - a.confidence);
      return results;
    }

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

  let model = string;
  // TODO: I think we should delete this.
  if (model.indexOf("http") === -1) {
    model = model.toLowerCase();
  }

  const instance = new ImageClassifier(model, video, options, callback);
  return callback ? instance : instance.ready;
};

export default imageClassifier;
