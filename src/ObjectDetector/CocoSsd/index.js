// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
    COCO-SSD Object detection
    Wraps the coco-ssd model in tfjs to be used in ml5
*/
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import callCallback from "../../utils/callcallback";
import handleArguments from "../../utils/handleArguments";

const DEFAULTS = {
  base: "lite_mobilenet_v2",
  modelUrl: undefined,
};

export class CocoSsdBase {
  /**
   * Create CocoSsd model. Works on video and images.
   * @param {function} constructorCallback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise
   *    that will be resolved once the model has loaded.
   */
  constructor(video, options, constructorCallback) {
    this.video = video || null;
    this.modelReady = false;
    this.isPredicting = false;
    this.config = {
      base: options.base || DEFAULTS.base,
      modelUrl: options.modelUrl || DEFAULTS.modelUrl,
    };
    this.callback = constructorCallback;

    this.ready = callCallback(this.loadModel(), this.callback);
  }

  /**
   * load model
   */
  async loadModel() {
    this.model = await cocoSsd.load(this.config);

    this.modelReady = true;
    return this;
  }

  /**
   * @typedef {Object} ObjectDetectorPrediction
   * @property {number} x - top left x coordinate of the prediction box in pixels.
   * @property {number} y - top left y coordinate of the prediction box in pixels.
   * @property {number} width - width of the prediction box in pixels.
   * @property {number} height - height of the prediction box in pixels.
   * @property {string} label - the label given.
   * @property {number} confidence - the confidence score (0 to 1).
   * @property {ObjectDetectorPredictionNormalized} normalized - a normalized object of the predicition
   */

  /**
   * @typedef {Object} ObjectDetectorPredictionNormalized
   * @property {number} x - top left x coordinate of the prediction box (0 to 1).
   * @property {number} y - top left y coordinate of the prediction box (0 to 1).
   * @property {number} width - width of the prediction box (0 to 1).
   * @property {number} height - height of the prediction box (0 to 1).
   */
  /**
   * Detect objects that are in video, returns bounding box, label, and confidence scores
   * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|ImageData} subject - Subject of the detection.
   * @returns {ObjectDetectorPrediction}
   */
  async detectInternal(imgToPredict) {
    this.isPredicting = true;
    const predictions = await this.model.detect(imgToPredict);
    const formattedPredictions = predictions.map(prediction => {
      return {
        label: prediction.class,
        confidence: prediction.score,
        x: prediction.bbox[0],
        y: prediction.bbox[1],
        width: prediction.bbox[2],
        height: prediction.bbox[3],
        normalized: {
          x: prediction.bbox[0] / imgToPredict.width,
          y: prediction.bbox[1] / imgToPredict.height,
          width: prediction.bbox[2] / imgToPredict.width,
          height: prediction.bbox[3] / imgToPredict.height,
        },
      };
    });
    this.isPredicting = false;
    return formattedPredictions;
  }

  /**
   * Detect objects that are in video, returns bounding box, label, and confidence scores
   * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|ImageData} subject - Subject of the detection.
   * @param {function} callback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise
   *    that will be resolved once the prediction is done.
   * @returns {ObjectDetectorPrediction}
   */
  async detect(inputOrCallback, cb) {
    await this.ready;
    await tf.nextFrame();

    const args = handleArguments(this.video, inputOrCallback, cb);
    args.require("image", "Detection subject not supported");

    return callCallback(this.detectInternal(args.image), args.callback);
  }
}

export const CocoSsd = (...inputs) => {
  const { video, options = {}, callback } = handleArguments(...inputs);
  return new CocoSsdBase(video, options, callback);
};

// export default CocoSsd;
