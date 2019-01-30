// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
/* eslint max-len: ["error", { "code": 180 }] */
/* eslint class-methods-use-this: off */
/*
*/

import * as tf from '@tensorflow/tfjs';
import CLASS_NAMES from './../utils/COCO_CLASSES';
import iou from './utils';

// this is a config for yolov2-tiny
const DEFAULTS = {
  // yolo version  : v2 || v3
  version: 'v2',
  // model Url
  URL: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/YOLO/model.json',

  // we can change this dynamically now whhoo!
  // 128 || 144 || 224 || 256 || 320 || 416 (or any multiple of 32 really)
  modelSize: 244,

  // inference parameters

  // IOU Thresh : 0
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,

  // labels
  classes: CLASS_NAMES,
  // model details

  masks: [
    [0, 1, 2, 3, 4],
  ],
  anchors: [
    [0.57273, 0.677385],
    [1.87446, 2.06253],
    [3.33843, 5.47434],
    [7.88282, 3.52778],
    [9.77052, 9.16828],
  ],
};

class YOLOBase {
  constructor(options = DEFAULTS) {
    this.IOUThreshold = options.IOUThreshold || DEFAULTS.IOUThreshold;
    this.classProbThreshold = options.classProbThreshold || DEFAULTS.classProbThreshold;

    this.modelURL = options.URL || DEFAULTS.URL;
    this.modelSize = options.modelSize || DEFAULTS.modelSize;
    this.version = options.version || DEFAULTS.version;

    this.anchors = options.anchors || DEFAULTS.anchors;
    this.masks = options.masks || DEFAULTS.masks;

    this.classNames = options.classes || DEFAULTS.classes;
    this.classesLength = this.classNames.length;
  }

  detect(img) {
    const detections = tf.tidy(() => {
      const data = this.preProcess(img);
      let predictions = this.model.predict(data);
      // i think this can be solved by by editing the model json
      if (this.version === 'v2') {
        predictions = [predictions];
      }
      const [boxes, confidence, classProbs] = this.postProcess(predictions);
      const [boxArr, scoresArr, classArr] = this.filterBoxes(boxes, confidence, classProbs, this.classProbThreshold);
      const [outboxArr, outscoresArr, outclassArr] = this.boxIOU(boxArr, scoresArr, classArr);
      const dets = this.finnalize(outboxArr, outscoresArr, outclassArr);
      return dets;
    });
    return detections;
  }

  detectV2(img) {
    const detections = tf.tidy(() => {
      const data = this.preProcess(img);
      let predictions = this.model.predict(data);
      // i think this can be solved by by editing the model json
      if (this.version === 'v2') {
        predictions = [predictions];
      }
      const output = this.postProcess(predictions);
      const [boxArr, scoresArr, classArr] = this.filterBoxesWithNMS(output[0], output[1], output[2], this.IOUThreshold, this.classProbThreshold);
      const groupedBoxArr = [];
      for (let i = 0; i < (boxArr.length / 4); i += 1) {
        groupedBoxArr.push([boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]]);
      }
      const dets = this.finnalize(groupedBoxArr, scoresArr, classArr);
      return dets;
    });
    return detections;
  }

  async detectAsync(img) {
    const output = tf.tidy(() => {
      const data = this.preProcess(img);
      let predictions = this.model.predict(data);
      // i think this can be solved by by editing the model json
      if (this.version === 'v2') {
        predictions = [predictions];
      }
      return this.postProcess(predictions);
    });
    const [boxArr, scoresArr, classArr] = await this.filterBoxesAsync(output[0], output[1], output[2], this.classProbThreshold);
    const [outboxArr, outscoresArr, outclassArr] = this.boxIOU(boxArr, scoresArr, classArr);
    const detections = this.finnalize(outboxArr, outscoresArr, outclassArr);
    tf.dispose(output);
    return detections;
  }
  async detectV2Async(img) {
    const output = tf.tidy(() => {
      const data = this.preProcess(img);
      let predictions = this.model.predict(data);
      // i think this can be solved by by editing the model json
      if (this.version === 'v2') {
        predictions = [predictions];
      }
      return this.postProcess(predictions);
    });
    const [boxArr, scoresArr, classArr] = await this.filterBoxesWithNMSAsync(output[0], output[1], output[2], this.IOUThreshold, this.classProbThreshold);
    const groupedBoxArr = [];
    for (let i = 0; i < (boxArr.length / 4); i += 1) {
      groupedBoxArr.push([boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]]);
    }
    const detections = this.finnalize(groupedBoxArr, scoresArr, classArr);
    tf.dispose(output);
    return detections;
  }

  async loadModel() {
    try {
      this.model = await tf.loadModel(this.modelURL);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // does not dispose of the model atm
  dispose() {
    tf.dispose(this.model);
    tf.disposeconstiables();
  }

  // should be called after load()
  async cache() {
    const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
    await this.detect(dummy);
    tf.dispose(dummy);
  }

  preProcess(img) {
    let image;
    if (!(img instanceof tf.Tensor)) {
      if (img instanceof HTMLImageElement || img instanceof HTMLVideoElement) {
        image = tf.fromPixels(img);
      } else if (typeof img === 'object' && (img.elt instanceof HTMLImageElement || img.elt instanceof HTMLVideoElement)) {
        image = tf.fromPixels(img.elt); // Handle p5.js image and video.
      }
    } else {
      image = img;
    }

    [this.imgWidth, this.imgHeight] = [image.shape[1], image.shape[0]];

    // Normalize the image from [0, 255] to [0, 1].
    const normalized = image.toFloat().div(tf.scalar(255));
    let resized = normalized;
    if (normalized.shape[0] !== this.modelSize || normalized.shape[1] !== this.modelSize) {
      const alignCorners = true;
      resized = tf.image.resizeBilinear(normalized, [this.modelSize, this.modelSize], alignCorners);
    }
    // Reshape to a single-element batch so we can pass it to predict.
    const batched = resized.reshape([1, this.modelSize, this.modelSize, 3]);
    return batched;
  }

  // this is expected to be  inside a tf.tidy
  postProcess(rawPrediction) {
    const boxes = [];
    const confidences = [];
    const classProbs = [];
    for (let i = 0; i < this.masks.length; i += 1) {
      const [box, confidence, prob] = this.processFeats(rawPrediction[i].squeeze([0]), this.masks[i], this.anchors, this.modelSize, this.classesLength, this.version);
      boxes.push(box);
      confidences.push(confidence);
      classProbs.push(prob);
    }
    const tBoxes = tf.concat(boxes, 0);
    const tConfidences = tf.concat(confidences, 0);
    const tClassProbs = tf.concat(classProbs, 0);
    const scaledBoxes = this.rescaleBoxes(tBoxes);

    return [scaledBoxes, tConfidences, tClassProbs];
  }

  // this is expected to be  inside a tf.tidy
  processFeats(prediction, mask, anchors, modelSize, classesLen, version) {
    const [outputWidth, outputHeight] = [prediction.shape[0], prediction.shape[1]];

    const anchorsArr = [];
    for (let i = 0; i < mask.length; i += 1) {
      anchorsArr.push(anchors[mask[i]]);
    }
    const anchorsLen = anchorsArr.length;
    const anchorsTensor = tf.tensor(anchorsArr).reshape([1, 1, anchorsLen, 2]);
    const numBoxes = outputWidth * outputHeight * anchorsLen;

    // classesLen + 5 =  classesLen + x + y + w + h + obj_score
    const reshaped = tf.reshape(prediction, [outputWidth, outputHeight, anchorsLen, classesLen + 5]);

    let boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, anchorsLen, 2]));
    let boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, anchorsLen, 2]));

    const boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, anchorsLen, 1])).reshape([numBoxes, 1]);
    const boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, anchorsLen, classesLen])).reshape([numBoxes, classesLen]);

    // prep
    let convIndex = tf.range(0, outputWidth);
    const convHeightIndex = tf.tile(convIndex, [outputHeight]);
    let convWidthindex = tf.tile(tf.expandDims(convIndex, 0), [outputWidth, 1]);
    convWidthindex = tf.transpose(convWidthindex).flatten();
    convIndex = tf.transpose(tf.stack([convHeightIndex, convWidthindex]));
    convIndex = tf.reshape(convIndex, [outputWidth, outputHeight, 1, 2]);
    const convDims = tf.reshape(tf.tensor1d([outputWidth, outputHeight]), [1, 1, 1, 2]);
    // end

    boxxy = tf.div(tf.add(boxxy, convIndex), convDims);

    boxwh = tf.mul(boxwh, anchorsTensor);
    if (version === 'v3') {
      boxwh = tf.div(boxwh, tf.tensor([modelSize]));
    } else {
      boxwh = tf.div(boxwh, convDims);
    }
    const boxes = this.boxesToCorners(boxxy, boxwh).reshape([numBoxes, 4]);

    return [boxes, boxConfidence, boxClassProbs];
  }


  async filterBoxesWithNMSAsync(boxes, boxConfidence, boxClassProbs, iouThresh, classProbThresh) {
    // class probabilities
    const allBoxScores = tf.mul(boxConfidence, boxClassProbs);
    const boxScores = tf.max(allBoxScores, -1);
    // class indices
    const boxClasses = tf.argMax(boxClassProbs, -1);
    // filter mask
    const filteredIndicesTensor = await tf.image.nonMaxSuppressionAsync(boxes, boxScores, 200, iouThresh, classProbThresh);
    const filteredBoxes = boxes.gather(filteredIndicesTensor);
    const filteredScores = boxScores.gather(filteredIndicesTensor);
    const filteredclasses = boxClasses.gather(filteredIndicesTensor);
    const [boxArr, scoreArr, classesArr] = await Promise.all([filteredBoxes.data(), filteredScores.data(), filteredclasses.data()]);
    tf.dispose([filteredBoxes, filteredScores, filteredclasses, allBoxScores, boxScores, boxClasses, filteredIndicesTensor]);
    return [boxArr, scoreArr, classesArr];
  }

  async filterBoxesAsync(boxes, boxConfidence, boxClassProbs, classProbThresh) {
    // class probabilities
    const allBoxScores = tf.mul(boxConfidence, boxClassProbs);
    const boxScores = tf.max(allBoxScores, -1);
    // class indices
    const boxClasses = tf.argMax(boxClassProbs, -1);
    // filter mask
    const filterThresh = tf.scalar(classProbThresh);
    const FilterMask = tf.greaterEqual(boxScores, filterThresh);
    const filteredIndices = await tf.whereAsync(FilterMask);
    const filteredIndicesTensor = filteredIndices.flatten();
    const filteredBoxes = boxes.gather(filteredIndicesTensor);
    const filteredScores = boxScores.gather(filteredIndicesTensor);
    const filteredclasses = boxClasses.gather(filteredIndicesTensor);
    const [boxArr, scoreArr, classesArr] = await Promise.all([filteredBoxes.data(), filteredScores.data(), filteredclasses.data()]);
    tf.dispose([filteredBoxes, filteredScores, filteredclasses, boxes, allBoxScores, boxScores, boxClasses, FilterMask, filteredIndicesTensor, filteredIndices, filterThresh]);
    return [boxArr, scoreArr, classesArr];
  }

  // this is expected to be  inside a tf.tidy
  filterBoxesWithNMS(boxes, boxConfidence, boxClassProbs, iouThresh, classProbThresh, maxBoxes) {
    // class probabilities
    const allBoxScores = tf.mul(boxConfidence, boxClassProbs);
    const boxScores = tf.max(allBoxScores, -1);
    // class indices
    const boxClasses = tf.argMax(boxClassProbs, -1);
    // filter mask
    const filteredIndicesTensor = tf.image.nonMaxSuppression(boxes, boxScores, maxBoxes, iouThresh, classProbThresh);
    const filteredBoxes = boxes.gather(filteredIndicesTensor);
    const filteredScores = boxScores.gather(filteredIndicesTensor);
    const filteredclasses = boxClasses.gather(filteredIndicesTensor);
    const [boxArr, scoreArr, classesArr] = [filteredBoxes.dataSync(), filteredScores.dataSync(), filteredclasses.dataSync()];
    tf.dispose([filteredBoxes, filteredScores, filteredclasses, allBoxScores, boxScores, boxClasses, filteredIndicesTensor]);
    return [boxArr, scoreArr, classesArr];
  }

  // this is expected to be  inside a tf.tidy
  filterBoxes(boxes, boxConfidence, boxClassProbs, classProbThresh) {
    // class probabilities
    const boxScores = tf.max(tf.mul(boxConfidence, boxClassProbs), -1);
    // class indices
    const boxClasses = tf.argMax(boxClassProbs, -1);
    // filter mask
    const filterThresh = tf.scalar(classProbThresh);
    const FilterMask = tf.greaterEqual(boxScores, filterThresh);

    const indicesTensor = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]).toInt();
    const NegativeIndicesTensor = tf.fill([boxes.shape[0]], -1, 'int32');

    const indices = tf.where(FilterMask, indicesTensor, NegativeIndicesTensor);
    const filteredIndicesTensor = tf.tensor1d(indices.dataSync().filter(i => i >= 0), 'int32');
    const filteredBoxes = boxes.gather(filteredIndicesTensor);
    const filteredScores = boxScores.gather(filteredIndicesTensor);
    const filteredclasses = boxClasses.gather(filteredIndicesTensor);
    const [boxArr, scoreArr, classesArr] = [filteredBoxes.dataSync(), filteredScores.dataSync(), filteredclasses.dataSync()];
    return [boxArr, scoreArr, classesArr];
  }

  // this is expected to be  inside a tf.tidy
  rescaleBoxes(boxes) {
    const Height = tf.scalar(this.imgHeight);
    const Width = tf.scalar(this.imgWidth);
    // this for y1 x1 y2 x2

    const ImageDims = tf.stack([Height, Width, Height, Width]).reshape([1, 4]);
    // this for x y w h
    // const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
    return boxes.mul(ImageDims);
  }

  // this is expected to be  inside a tf.tidy
  boxesToCorners(boxXY, boxWH) {
    const two = tf.tensor1d([2.0]);
    const boxMins = tf.sub(boxXY, tf.div(boxWH, two));
    const boxMaxes = tf.add(boxXY, tf.div(boxWH, two));
    const dim0 = boxMins.shape[0];
    const dim1 = boxMins.shape[1];
    const dim2 = boxMins.shape[2];
    const size = [dim0, dim1, dim2, 1];
    return tf.concat([
      boxMins.slice([0, 0, 0, 1], size),
      boxMins.slice([0, 0, 0, 0], size),
      boxMaxes.slice([0, 0, 0, 1], size),
      boxMaxes.slice([0, 0, 0, 0], size),
    ], 3);
  }


  boxIOU(boxArr, scoreArr, classesArr) {
    const zipped = [];
    for (let i = 0; i < scoreArr.length; i += 1) {
      // [Score,x,y,w,h,classindex]
      zipped.push([
        scoreArr[i],
        [boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]],
        classesArr[i],
      ]);
    }
    // Sort by descending order of scores (first index of zipped array)
    const sorted = zipped.sort((a, b) => b[0] - a[0]);
    const outBoxArr = [];
    const outScoreArr = [];
    const outClassesArr = [];
    // Greedily go through boxes in descending score order and only
    // return boxes that are below the IoU threshold.
    for (let i = 0; i < sorted.length; i += 1) {
      let Push = true;
      for (let j = 0; j < outBoxArr.length; j += 1) {
        const IOU = iou(outBoxArr[j], sorted[i][1]);
        if (IOU > this.IOUThreshold) {
          Push = false;
          break;
        }
      }
      if (Push) {
        outBoxArr.push(sorted[i][1]);
        outScoreArr.push(sorted[i][0]);
        outClassesArr.push(sorted[i][2]);
      }
    }
    //
    return [outBoxArr, outScoreArr, outClassesArr];
  }

  finnalize(boxArr, scoreArr, classesArr) {
    const detections = [];

    for (let i = 0; i < scoreArr.length; i += 1) {
      // add any out put you want
      // choose output format
      // currently its x1,y1,x2,y2
      // x1 = x - (w/2)
      // y1 = y - (h/2)
      // x2 = x + (w/2)
      // y2 = y + (h/2)
      // as for x y w h
      // Warning !  x and y are for the center of the bounding box
      // w = x2-x1
      // h = y2-y1
      // x = x1 + (w/2) || x2 - (w/2)
      // y = y1 - (h/2) || y2 + (h/2)
      const classProb = scoreArr[i];
      const [y1, x1, y2, x2] = boxArr[i];

      // Warning !  x and y are for the center of the bounding box
      const w = x2 - x1;
      const h = y2 - y1;
      const x = x1 + (w / 2);
      const y = y1 - (h / 2);

      const className = this.classNames[classesArr[i]];
      const classIndex = classesArr[i];

      const detection = {
        id: i,
        className,
        classProb,
        classIndex,
        // x1,y1,x2,y2,
        x,
        y,
        w,
        h,
      };
      detections.push(detection);
    }
    return detections;
  }
}
const YOLO = options => new YOLOBase(options);
export default YOLO;
