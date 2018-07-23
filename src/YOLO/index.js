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
import CLASS_NAMES from './../utils/COCO_CLASSES';
import iou from './utils';

const DEFAULTS = {
  filterBoxesThreshold: 0.01,
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
  URL: 'https://raw.githubusercontent.com/ml5js/ml5-library/master/src/YOLO/model.json',

};

class YOLO {
  constructor(options) {
    this.filterBoxesThreshold = options.filterBoxesThreshold || DEFAULTS.filterBoxesThreshold;
    this.IOUThreshold = options.IOUThreshold || DEFAULTS.IOUThreshold;
    this.classProbThreshold = options.classProbThreshold || DEFAULTS.classProbThreshold;
    this.modelURL = options.url || DEFAULTS.URL;
    this.model = null;
    this.inputWidth = 416;
    this.inputHeight = 416;
    this.classNames = CLASS_NAMES;
    this.anchors = [
      [0.57273, 0.677385],
      [1.87446, 2.06253],
      [3.33843, 5.47434],
      [7.88282, 3.52778],
      [9.77052, 9.16828],
    ];
    // this.scaleX;
    // this.scaleY;
    this.anchorsLength = this.anchors.length;
    this.classesLength = this.classNames.length;
    this.init();
  }

  init() {
    // indices tensor to filter the elements later on
    this.indicesTensor = tf.range(1, 846, 1, 'int32');

    // Grid To Split the raw predictions : Assumes Our Model output is 1 Tensor with 13x13x425
    // gonna hard code all this stuff see if it works
    // this can be done once at the initial phase
    // TODO : make this more modular

    [this.ConvIndex, this.ConvDims, this.AnchorsTensor] = tf.tidy(() => {
      let ConvIndex = tf.range(0, 13);
      const ConvHeightIndex = tf.tile(ConvIndex, [13]);

      let ConvWidthindex = tf.tile(tf.expandDims(ConvIndex, 0), [13, 1]);
      ConvWidthindex = tf.transpose(ConvWidthindex).flatten();

      ConvIndex = tf.transpose(tf.stack([ConvHeightIndex, ConvWidthindex]));
      ConvIndex = tf.reshape(ConvIndex, [13, 13, 1, 2]);

      const ConvDims = tf.reshape(tf.tensor1d([13, 13]), [1, 1, 1, 2]);
      // AnchorsTensor
      const Aten = tf.tensor2d(this.anchors);
      const AnchorsTensor = tf.reshape(Aten, [1, 1, this.anchorsLength, 2]);

      return [ConvIndex, ConvDims, AnchorsTensor];
    });
  }

  // takes  HTMLCanvasElement || HTMLImageElement ||HTMLVideoElement || ImageData as input
  // outs results obj
  async detect(input) {
    const predictions = tf.tidy(() => {
      const data = this.preProccess(input);
      const preds = this.model.predict(data);
      return preds;
    });
    const results = await this.postProccess(predictions);
    return results;
  }

  async loadModel() {
    try {
      this.model = await tf.loadModel(this.modelURL);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // does not dispose of the model atm
  dispose() {
    this.model = null;
    tf.disposeconstiables();
  }

  // should be called after loadModel()
  cache() {
    tf.tidy(() => {
      const dummy = tf.zeros([0, 416, 416, 3]);
      this.model.predict(dummy);
    });
  }

  preProccess(input) {
    const img = tf.fromPixels(input);
    const [w, h] = [img.shape[1], img.shape[0]];
    this.imgWidth = w;
    this.imgHeight = h;

    const img1 = tf.image.resizeBilinear(img, [this.inputHeight, this.inputWidth]).toFloat().div(tf.scalar(255)).expandDims(0);

    // Scale Stuff
    this.scaleX = this.imgHeight / this.inputHeight;
    this.scaleY = this.imgWidth / this.inputWidth;
    return img1;
  }

  async postProccess(rawPrediction) {
    const results = {
      totalDetections: 0,
      detections: [],
    };
    const [boxes, boxScores, classes, Indices] = tf.tidy(() => {
      const rawPrediction1 = tf.reshape(rawPrediction, [13, 13, this.anchorsLength, this.classesLength + 5]);
      // Box Coords
      const boxxy = tf.sigmoid(rawPrediction1.slice([0, 0, 0, 0], [13, 13, this.anchorsLength, 2]));
      const boxwh = tf.exp(rawPrediction1.slice([0, 0, 0, 2], [13, 13, this.anchorsLength, 2]));
      // ObjectnessScore
      const boxConfidence = tf.sigmoid(rawPrediction1.slice([0, 0, 0, 4], [13, 13, this.anchorsLength, 1]));
      // ClassProb
      const boxClassProbs = tf.softmax(rawPrediction1.slice([0, 0, 0, 5], [13, 13, this.anchorsLength, this.classesLength]));

      // from boxes with xy wh to x1,y1 x2,y2
      // Mainly for NMS + rescaling
      /*
            x1 = x + (h/2)
            y1 = y - (w/2)
            x2 = x - (h/2)
            y2 = y + (w/2)
            */
      // BoxScale
      const boxXY1 = tf.div(tf.add(boxxy, this.ConvIndex), this.ConvDims);

      const boxWH1 = tf.div(tf.mul(boxwh, this.AnchorsTensor), this.ConvDims);

      const Div = tf.div(boxWH1, tf.scalar(2));

      const boxMins = tf.sub(boxXY1, Div);
      const boxMaxes = tf.add(boxXY1, Div);

      const size = [boxMins.shape[0], boxMins.shape[1], boxMins.shape[2], 1];

      // main box tensor
      const finalboxes = tf.concat([
        boxMins.slice([0, 0, 0, 1], size),
        boxMins.slice([0, 0, 0, 0], size),
        boxMaxes.slice([0, 0, 0, 1], size),
        boxMaxes.slice([0, 0, 0, 0], size),
      ], 3).reshape([845, 4]);

      // Filterboxes by objectness threshold
      // not filtering / getting a mask really

      const boxConfidence1 = boxConfidence.squeeze([3]);
      const objectnessMask = tf.greaterEqual(boxConfidence1, tf.scalar(this.filterBoxesThreshold));

      // Filterboxes by class probability threshold
      const boxScores1 = tf.mul(boxConfidence1, tf.max(boxClassProbs, 3));
      const boxClassProbMask = tf.greaterEqual(boxScores1, tf.scalar(this.classProbThreshold));

      //  getting classes indices
      const classes1 = tf.argMax(boxClassProbs, -1);

      // Final Mask  each elem that survived both filters (0x0 0x1 1x0 = fail ) 1x1 = survived
      const finalMask = boxClassProbMask.mul(objectnessMask);

      const indices = finalMask.flatten().toInt().mul(this.indicesTensor);
      return [finalboxes, boxScores1, classes1, indices];
    });

    // we started at one in the range so we remove 1 now

    const indicesArr = Array.from(await Indices.data()).filter(i => i > 0).map(i => i - 1);

    if (indicesArr.length === 0) {
      boxes.dispose();
      boxScores.dispose();
      classes.dispose();
      return results;
    }
    const [filteredBoxes, filteredScores, filteredclasses] = tf.tidy(() => {
      const indicesTensor = tf.tensor1d(indicesArr, 'int32');
      const filteredBoxes1 = boxes.gather(indicesTensor);
      const filteredScores1 = boxScores.flatten().gather(indicesTensor);
      const filteredclasses1 = classes.flatten().gather(indicesTensor);
      // Img Rescale
      const Height = tf.scalar(this.imgHeight);
      const Width = tf.scalar(this.imgWidth);
      // 4
      const ImageDims = tf.stack([Height, Width, Height, Width]).reshape([1, 4]);
      const filteredBoxes2 = filteredBoxes1.mul(ImageDims);
      return [filteredBoxes2, filteredScores1, filteredclasses1];
    });

    // NonMaxSuppression
    // GreedyNMS
    const [boxArr, scoreArr, classesArr] = await Promise.all([filteredBoxes.data(), filteredScores.data(), filteredclasses.data()]);
    filteredBoxes.dispose();
    filteredScores.dispose();
    filteredclasses.dispose();

    const zipped = [];
    for (let i = 0; i < scoreArr.length; i += 1) {
      // [Score,x,y,w,h,classindex]
      zipped.push([scoreArr[i], [boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]], classesArr[i]]);
    }

    // Sort by descending order of scores (first index of zipped array)
    const sorted = zipped.sort((a, b) => b[0] - a[0]);
    const selectedBoxes = [];
    // Greedily go through boxes in descending score order and only
    // return boxes that are below the IoU threshold.
    sorted.forEach((box) => {
      let Push = true;
      for (let i = 0; i < selectedBoxes.length; i += 1) {
        // Compare IoU of zipped[1], since that is the box coordinates arr
        const IOU = iou(box[1], selectedBoxes[i][1]);
        if (IOU > this.IOUThreshold) {
          Push = false;
          break;
        }
      }
      if (Push) selectedBoxes.push(box);
    });

    // final phase

    // add any output you want
    for (let id = 0; id < selectedBoxes.length; id += 1) {
      const classProb = selectedBoxes[id][0];
      const classProbRounded = Math.round(classProb * 1000) / 10;
      const className = this.classNames[selectedBoxes[id][2]];
      const classIndex = selectedBoxes[id][2];
      const [y1, x1, y2, x2] = selectedBoxes[id][1];
      // Need to get this out
      // TODO :  add a hsla color for later visualization
      const resultObj = {
        id,
        className,
        classIndex,
        classProb,
        classProbRounded,
        x1,
        y1,
        x2,
        y2,
      };
      results.detections.push(resultObj);
    }
    // Misc
    results.totalDetections = results.detections.length;
    results.scaleX = this.scaleX;
    results.scaleY = this.scaleY;
    return results;
  }
}

export default YOLO;
