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
import Video from '../utils/Video';
import { imgToTensor } from '../utils/imageUtilities';
import callCallback from '../utils/callcallback';
import CLASS_NAMES from './../utils/COCO_CLASSES';

import {
  nonMaxSuppression,
  boxesToCorners,
  head,
  filterBoxes,
  ANCHORS,
} from './postprocess';

const URL = 'https://raw.githubusercontent.com/ml5js/ml5-library/master/src/YOLO/model.json';

const DEFAULTS = {
  filterBoxesThreshold: 0.01,
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
};

// Size of the video
const imageSize = 416;

class YOLOBase extends Video {
  constructor(video, options, callback) {
    super(video, imageSize);

    this.filterBoxesThreshold = options.filterBoxesThreshold || DEFAULTS.filterBoxesThreshold;
    this.IOUThreshold = options.IOUThreshold || DEFAULTS.IOUThreshold;
    this.classProbThreshold = options.classProbThreshold || DEFAULTS.classProbThreshold;
    this.modelReady = false;
    this.isPredicting = false;
    this.ready = callCallback(this.loadModel(), callback);
  }

  async loadModel() {
    if (this.video) {
      await this.loadVideo();
    }
    this.model = await tf.loadModel(URL);
    this.modelReady = true;
    return this;
  }

  async detect(inputOrCallback, cb) {
    let imgToPredict;
    let callback = cb;
    if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
      imgToPredict = inputOrCallback;
    } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement || inputOrCallback.elt instanceof HTMLVideoElement)) {
      imgToPredict = inputOrCallback.elt; // Handle p5.js image and video.
    } else if (typeof inputOrCallback === 'function') {
      imgToPredict = this.video;
      callback = inputOrCallback;
    }
    return callCallback(this.detectInternal(imgToPredict), callback);
  }

  async detectInternal(imgToPredict) {
    await this.ready;
    this.isPredicting = true;
    const [allBoxes, boxConfidence, boxClassProbs] = tf.tidy(() => {
      const input = imgToTensor(imgToPredict);
      const activation = this.model.predict(input);
      const [boxXY, boxWH, bConfidence, bClassProbs] = head(activation, ANCHORS, 80);
      const aBoxes = boxesToCorners(boxXY, boxWH);
      return [aBoxes, bConfidence, bClassProbs];
    });

    const [boxes, scores, classes] = await filterBoxes(allBoxes, boxConfidence, boxClassProbs, this.filterBoxesThreshold);

    // If all boxes have been filtered out
    if (boxes == null) {
      return [];
    }

    const width = tf.scalar(imageSize);
    const height = tf.scalar(imageSize);
    const imageDims = tf.stack([height, width, height, width]).reshape([1, 4]);
    const boxesModified = tf.mul(boxes, imageDims);

    const [preKeepBoxesArr, scoresArr] = await Promise.all([
      boxesModified.data(), scores.data(),
    ]);

    const [keepIndx, boxesArr, keepScores] = nonMaxSuppression(
      preKeepBoxesArr,
      scoresArr,
      this.IOUThreshold,
    );

    const classesIndxArr = await classes.gather(tf.tensor1d(keepIndx, 'int32')).data();

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
        className,
        classProb,
        x: x / imageSize,
        y: y / imageSize,
        w: w / imageSize,
        h: h / imageSize,
      };

      results.push(resultObj);
    });

    await tf.nextFrame();
    this.isPredicting = false;
    return results;
  }
}

const YOLO = (videoOrOptionsOrCallback, optionsOrCallback, cb) => {
  let callback = cb;
  let options = {};
  const video = videoOrOptionsOrCallback;

  if (typeof videoOrOptionsOrCallback === 'object') {
    options = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'function') {
    callback = videoOrOptionsOrCallback;
  }

  if (typeof optionsOrCallback === 'object') {
    options = optionsOrCallback;
  } else if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback;
  }

  const instance = new YOLOBase(video, options, callback);
  return cb ? instance : instance.ready;
};

export default YOLO;
