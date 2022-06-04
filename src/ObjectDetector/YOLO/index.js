// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
/* eslint max-len: ["error", { "code": 180 }] */

/*
YOLO Object detection
Heavily derived from https://github.com/ModelDepot/tfjs-yolo-tiny (ModelDepot: modeldepot.io)
*/

import * as tf from '@tensorflow/tfjs';
import handleArguments from "../../utils/handleArguments";
import Video from './../../utils/Video';
import { imgToTensor } from "./../../utils/imageUtilities";
import callCallback from './../../utils/callcallback';
import CLASS_NAMES from './../../utils/COCO_CLASSES';
import modelLoader from './../../utils/modelLoader';

import {
  nonMaxSuppression,
  boxesToCorners,
  head,
  filterBoxes,
} from './postprocess';

const DEFAULTS = {
  modelUrl: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-training/master/models/YOLO/model.json',
  filterBoxesThreshold: 0.01,
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
};

// Size of the video
const imageSize = 416;

export class YOLOBase extends Video {
  /**
   * @deprecated Please use ObjectDetector class instead
   */
  /**
   * @typedef {Object} options
   * @property {number} filterBoxesThreshold - default 0.01
   * @property {number} IOUThreshold - default 0.4
   * @property {number} classProbThreshold - default 0.4
   */
  /**
   * Create YOLO model. Works on video and images. 
   * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|ImageData} video - Optional. The video to be used for object detection and classification.
   * @param {Object} options - Optional. A set of options.
   * @param {function} callback - Optional. A callback function that is called once the model has loaded.
   */
  constructor(video, options, callback) {
    super(video, imageSize);

    this.modelUrl = options.modelUrl || DEFAULTS.modelUrl;
    this.filterBoxesThreshold = options.filterBoxesThreshold || DEFAULTS.filterBoxesThreshold;
    this.IOUThreshold = options.IOUThreshold || DEFAULTS.IOUThreshold;
    this.classProbThreshold = options.classProbThreshold || DEFAULTS.classProbThreshold;
    this.modelReady = false;
    this.isPredicting = false;
    this.callback = callback;
    this.ready = callCallback(this.loadModel(), this.callback);

    if (!options.disableDeprecationNotice) {
      console.warn("WARNING! Function YOLO has been deprecated, please use the new ObjectDetector function instead");
    }
  }

  async loadModel() {
    if (this.videoElt && !this.video) {
      this.video = await this.loadVideo();
    }

    const loader = modelLoader(this.modelUrl, 'model');
    this.model = await loader.loadLayersModel();

    this.modelReady = true;
    return this;
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
    // TODO: should it have await tf.nextFrame(); here like in cocossd?

    const args = handleArguments(this.video, inputOrCallback, cb);
    args.require("image", "Detection subject not supported");

    return callCallback(this.detectInternal(args.image), args.callback);
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
    await this.ready;
    await tf.nextFrame();

    const ANCHORS = tf.tensor2d([
      [0.57273, 0.677385],
      [1.87446, 2.06253],
      [3.33843, 5.47434],
      [7.88282, 3.52778],
      [9.77052, 9.16828],
    ]);

    this.isPredicting = true;
    const [allBoxes, boxConfidence, boxClassProbs] = tf.tidy(() => {
      const input = imgToTensor(imgToPredict, [imageSize, imageSize]);
      const activation = this.model.predict(input);
      const [boxXY, boxWH, bConfidence, bClassProbs] = head(activation, ANCHORS, 80);
      const aBoxes = boxesToCorners(boxXY, boxWH);
      return [aBoxes, bConfidence, bClassProbs];
    });

    const [boxes, scores, classes] = await filterBoxes(allBoxes, boxConfidence, boxClassProbs, this.filterBoxesThreshold);

    allBoxes.dispose();
    boxConfidence.dispose();
    boxClassProbs.dispose();
    // If all boxes have been filtered out
    if (boxes == null) {
      return [];
    }
    return tf.tidy(() => {
      const width = tf.scalar(imageSize);
      const height = tf.scalar(imageSize);
      const imageDims = tf.stack([height, width, height, width]).reshape([1, 4]);
      const boxesModified = tf.mul(boxes, imageDims);

      const preKeepBoxesArr = boxesModified.dataSync();
      const scoresArr = scores.dataSync();

      const [keepIndx, boxesArr, keepScores] = nonMaxSuppression(
        preKeepBoxesArr,
        scoresArr,
        this.IOUThreshold,
      );

      const classesIndxArr = classes.gather(tf.tensor1d(keepIndx, 'int32')).dataSync();

      const results = [];

      classesIndxArr.forEach((classIndx, i) => {
        const classProb = keepScores[i];
        if (classProb < this.classProbThreshold) {
          return;
        }

        const className = CLASS_NAMES[classIndx];
        let [y, x, h, w] = boxesArr[i];

        y = Math.max(0, y);
        x = Math.max(0, x);
        h = Math.min(imageSize, h) - y;
        w = Math.min(imageSize, w) - x;

        const resultObj = {
          label: className,
          confidence: classProb,
          x,
          y,
          width: w,
          height: h,
          normalized: {
            x: x / imageSize,
            y: y / imageSize,
            width: w / imageSize,
            height: h / imageSize,
          }
        };

        results.push(resultObj);
      });

      this.isPredicting = false;

      width.dispose()
      height.dispose()
      imageDims.dispose()
      boxesModified.dispose()
      boxes.dispose();
      scores.dispose();
      classes.dispose();
      ANCHORS.dispose();


      return results;
    })

  }
}

export const YOLO = (...inputs) => {
  const { video, options = {}, callback } = handleArguments(...inputs);
  return new YOLOBase(video, options, callback);
};

// export default YOLO;
