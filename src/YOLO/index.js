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
import { processVideo, imgToTensor } from '../utils/imageUtilities';

import CLASS_NAMES from './../utils/COCO_CLASSES';

import {
  nonMaxSuppression,
  boxesToCorners,
  head,
  filterBoxes,
  ANCHORS,
} from './postprocess';

const URL = 'https://raw.githubusercontent.com/MikeShi42/yolo-tiny-tfjs/master/model2.json';

const DEFAULTS = {
  filterBoxesThreshold: 0.01,
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
};

// Size of the video
const inputDim = 416;

// TODO: add callback to constructor
class YOLO {
  constructor(video = null, options = {}) {
    this.filterBoxesThreshold = options.filterBoxesThreshold || DEFAULTS.filterBoxesThreshold;
    this.IOUThreshold = options.IOUThreshold || DEFAULTS.IOUThreshold;
    this.classProbThreshold = options.classProbThreshold || DEFAULTS.classProbThreshold;
    this.imageSize = 416;
    this.modelReady = false;
    this.videoReady = false;
    this.isPredicting = false;

    this.loadModel();

    if (video instanceof HTMLVideoElement) {
      this.video = processVideo(video, this.imageSize, () => {
        this.videoReady = true;
      });
    }
  }

  async loadModel() {
    this.model = await tf.loadModel(URL);
    this.modelReady = true;
  }

  async detect(inputOrCallback, cb = null) {
    if (this.modelReady && this.videoReady && !this.predicting) {
      let imgToPredict;
      let callback;
      this.isPredicting = true;

      if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
        imgToPredict = inputOrCallback;
        callback = cb;
      } else {
        imgToPredict = this.video;
        callback = inputOrCallback;
      }

      const input = imgToTensor(imgToPredict);

      const [allBoxes, boxConfidence, boxClassProbs] = tf.tidy(() => {
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

      const width = tf.scalar(inputDim);
      const height = tf.scalar(inputDim);
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
        h = Math.min(416, h) - y;
        w = Math.min(416, w) - x;

        const resultObj = {
          className,
          classProb,
          x: x / 416,
          y: y / 416,
          w: w / 416,
          h: h / 416,
        };

        results.push(resultObj);
      });

      await tf.nextFrame();
      this.isPredicting = false;

      if (callback) {
        callback(results);
      }

      return results;
    }
    return 'Model not Loaded';
  }
}

export default YOLO;

