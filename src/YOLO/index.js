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
  URL: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/YOLO/model.json',
  imageSize: 416,
};

class YOLOBase {
  constructor(options) {
    this.filterBoxesThreshold = options.filterBoxesThreshold || DEFAULTS.filterBoxesThreshold;
    this.IOUThreshold = options.IOUThreshold || DEFAULTS.IOUThreshold;
    this.classProbThreshold = options.classProbThreshold || DEFAULTS.classProbThreshold;
    this.modelURL = options.url || DEFAULTS.URL;
    this.model = null;
    this.imageSize = options.imageSize || DEFAULTS.imageSize;
    this.classNames = CLASS_NAMES;
    this.anchors = [
      [0.57273, 0.677385],
      [1.87446, 2.06253],
      [3.33843, 5.47434],
      [7.88282, 3.52778],
      [9.77052, 9.16828],
    ];
    this.anchorsLength = this.anchors.length;
    this.classesLength = this.classNames.length;
    this.init();
  }

  init() {
    const Aten = tf.tensor2d(this.anchors);
    this.anchorsTensor = tf.reshape(Aten, [1, 1, this.anchorsLength, 2]);
    Aten.dispose();
  }

  /**
   * Infers through the model.
   * TODO : Optionally takes an endpoint to return an intermediate activation.
   * @param img The image to classify. Can be a tensor or a DOM element image,
   * video, or canvas.
   * img: tf.Tensor3D|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement
   */
  async detect(img) {
    const predictions = tf.tidy(() => {
      const data = this.preProcess(img);
      const preds = this.model.predict(data);
      return preds;
    });
    const results = await this.postProcess(predictions);
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

  // should be called after load()
  async cache() {
    const dummy = tf.zeros([416, 416, 3]);
    await this.detect(dummy);
    dummy.dispose();
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
    if (normalized.shape[0] !== this.imageSize || normalized.shape[1] !== this.imageSize) {
      const alignCorners = true;
      resized = tf.image.resizeBilinear(normalized, [this.imageSize, this.imageSize], alignCorners);
    }
    // Reshape to a single-element batch so we can pass it to predict.
    const batched = resized.reshape([1, this.imageSize, this.imageSize, 3]);
    // Scale Stuff
    // this.scaleX = this.imgHeight / this.inputHeight;
    // this.scaleY = this.imgWidth / this.inputWidth;
    return batched;
  }

  /**
   * postProcessing for the yolo output
   * TODO : make this more modular in preperation for yolov3-tiny
   * @param rawPrediction a 4D tensor
   */
  async postProcess(rawPrediction) {
    const [boxes, boxScores, classes, Indices] = tf.tidy(() => this.split(rawPrediction.squeeze([0]), this.anchorsTensor));
    // for the case of yolov3  there are 2 output tensors
    // v3
    // this.split(rawPrediction[0], this.AnchorsTensorL1);
    // this.split(rawPrediction[1], this.AnchorsTensorL2);

    // we started at one in the range so we remove 1 now
    // this is where a major bottleneck happens
    // this can be replaced with tf.boolean_mask() if tfjs team implements it
    // this is also why wehave 2 tf.tidy()'s
    // more info : https://github.com/ModelDepot/tfjs-yolo-tiny/issues/6

    const indicesArr = Array.from(await Indices.data()).filter(i => i > 0).map(i => i - 1);

    if (indicesArr.length === 0) {
      boxes.dispose();
      boxScores.dispose();
      classes.dispose();
      return [];
    }

    const [filteredBoxes, filteredScores, filteredclasses] = tf.tidy(() => {
      const indicesTensor = tf.tensor1d(indicesArr, 'int32');
      const filteredBoxes1 = boxes.gather(indicesTensor);
      const filteredScores1 = boxScores.flatten().gather(indicesTensor);
      const filteredclasses1 = classes.flatten().gather(indicesTensor);
      // Image Rescale
      const Height = tf.scalar(this.imgHeight);
      const Width = tf.scalar(this.imgWidth);
      // this for x1 y1 x2 y2
      // const ImageDims = tf.stack([Height, Width, Height, Width]).reshape([1, 4]);

      // this for x y w h
      const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
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
        // this a quick fix that can be done muck better the iou atm takes x1 y1 x2 y2 and we have xy wh
        // this is dirty & needs to be directly  edited in the iou func
        // x1 = x - (w/2)
        // y1 = y - (h/2)
        // x2 = x + (w/2)
        // y2 = y + (h/2)
        const a = selectedBoxes[i][1];
        const b = box[1];
        const box1 = [b[0] - (b[2] / 2), b[1] - (b[3] / 2), b[0] + (b[2] / 2), b[1] + (b[3] / 2)];
        const box2 = [a[0] - (a[2] / 2), a[1] - (a[3] / 2), a[0] + (a[2] / 2), a[1] + (a[3] / 2)];
        const IOU = iou(box1, box2);
        if (IOU > this.IOUThreshold) {
          Push = false;
          break;
        }
      }
      if (Push) selectedBoxes.push(box);
    });
    // final phase
    const detections = [];
    // add any output you want
    for (let id = 0; id < selectedBoxes.length; id += 1) {
      const classProb = selectedBoxes[id][0];
      const className = this.classNames[selectedBoxes[id][2]];
      const [x, y, w, h] = selectedBoxes[id][1];
      const classIndex = selectedBoxes[id][2];
      // TODO :  add a hsla color for later visualization
      const detection = {
        id,
        className,
        classProb,
        classIndex,
        x,
        y,
        w,
        h,
      };
      detections.push(detection);
    }
    return detections;
  }

  split(rawPrediction, AnchorsTensor) {
    const [outputWidth, outputHeight] = [rawPrediction.shape[0], rawPrediction.shape[1]];
    const reshaped = tf.reshape(rawPrediction, [outputWidth, outputHeight, this.anchorsLength, this.classesLength + 5]);
    // Box Coords
    const boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, this.anchorsLength, 2]));
    const boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, this.anchorsLength, 2]));
    // ObjectnessScore
    const boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, this.anchorsLength, 1]));
    // ClassProb
    const boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, this.anchorsLength, this.classesLength]));

    // this assumes that we have a square output tensor eg 13x13 // 26x26
    // this is making an index map to add to the w y coordinates
    // see this
    let ConvIndex = tf.range(0, outputWidth);
    const ConvHeightIndex = tf.tile(ConvIndex, [outputWidth]);
    let ConvWidthindex = tf.tile(tf.expandDims(ConvIndex, 0), [outputWidth, 1]);
    ConvWidthindex = tf.transpose(ConvWidthindex).flatten();
    ConvIndex = tf.transpose(tf.stack([ConvHeightIndex, ConvWidthindex]));

    ConvIndex = tf.reshape(ConvIndex, [outputWidth, outputWidth, 1, 2]);
    const ConvDims = tf.reshape(tf.tensor1d([outputWidth, outputWidth]), [1, 1, 1, 2]);
    // ConvIndex.print();
    const boxxy1 = tf.div(tf.add(boxxy, ConvIndex), ConvDims);
    const boxwh1 = tf.div(tf.mul(boxwh, AnchorsTensor), ConvDims);

    // TODO : need to get the anchors size frome the input anchors tensor
    const finalboxes = tf.concat([boxxy1, boxwh1], 3).reshape([(outputWidth * outputHeight * this.anchorsLength), 4]);

    // Filterboxes by objectness threshold
    // not filtering / getting a mask really
    const boxConfidence1 = boxConfidence.squeeze([3]);
    const objectnessMask = tf.greaterEqual(boxConfidence1, tf.scalar(this.filterBoxesThreshold));

    // Filterboxes by class probability threshold
    const boxScores1 = tf.mul(boxConfidence1, tf.max(boxClassProbs, 3));
    const boxClassProbMask = tf.greaterEqual(boxScores1, tf.scalar(this.classProbThreshold));

    // getting classes indices
    const classes1 = tf.argMax(boxClassProbs, -1);

    // removed this from init as it semm to not be affecting perf very much
    const indicesTensor = tf.range(1, (outputWidth * outputHeight * this.anchorsLength) + 1, 1, 'int32');
    // Final Mask each elem that survived both filters (0x0 0x1 1x0 = fail ) 1x1 = survived
    const finalMask = boxClassProbMask.mul(objectnessMask);
    const indices = finalMask.flatten().toInt().mul(indicesTensor);
    return [finalboxes, boxScores1, classes1, indices];
  }
}

const YOLO = options => new YOLOBase(options);
export default YOLO;
