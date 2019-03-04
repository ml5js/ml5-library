// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
/* eslint max-len: ["error", { "code": 180 }] */
/* eslint class-methods-use-this: off */
/*
*/

import * as tf from '@tensorflow/tfjs';
import iou from './utils';
import COCO_CLASSES from './../utils/COCO_CLASSES';
import callCallback from '../utils/callcallback';


// this is a config for yolov2-tiny
const DEFAULTS = {

  // Model URL
  modelURL: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/YOLO/model.json',
  // Model version : this is important as there is some post processing changes 'v2' ||'v3'
  version: 'v2',
  // this is the size of the model input image : we can lower this to gain more performance
  //  the ones that i found to be a good compromise between perf/accracy are 224, 256, 320
  modelSize: 416, // 128 , 160 , 192 , 224 , 256 , 288 , 320 , 352 , 384 , 416,

  // Intersection Over Union threshhold and Class probability threshold  we use this to filter the output of the neural net 
  iouThreshold: 0.5,
  classProbThreshold: 0.5,

  // class labels
  labels: COCO_CLASSES,

  // more info see  Dimension Clusters : https://arxiv.org/pdf/1612.08242.pdf
  anchors: [
    [0.57273, 0.677385],
    [1.87446, 2.06253],
    [3.33843, 5.47434],
    [7.88282, 3.52778],
    [9.77052, 9.16828],
  ],
  // in yolo v3  the neural net  give 2 or more outputs(set of boxes) so this mask splits the anchors to groups
  // each corresponding to a spesific layer/output.
  // for example  the tiny yolo v2 outputs 1 output that has 13x13x5 boxes (if you use 416 as a model size)
  masks: [
    [0, 1, 2, 3, 4],
  ],

  // this is just more customization options concerning the preprocessing  pahse
  preProcessingOptions: {
    // 'NearestNeighbor'  - this output a more accurate image but but take a bit longer
    // 'Bilinear' - this faster but scrifices image quality
    ResizeOption: 'Bilinear',
    AlignCorners: true,
  },
};

class YOLODetector {
  constructor(video, options, callback) {
    this.video = video;
    this.model = null;

    this.modelURL = options.modelURL;
    this.version = options.version;
    this.modelSize = options.modelSize;
    this.iouThreshold = options.iouThreshold;
    this.classProbThreshold = options.classProbThreshold;
    this.labels = options.labels;
    this.anchors = options.anchors;
    this.masks = options.masks;
    this.preProcessingOptions = options.preProcessingOptions;
    // this is just some utility stuff
    this.classesLength = this.labels.length;

    // Load the model
    this.ready = callCallback(this.loadModel(), callback);
    // or
    // this.ready = callCallback(this.loadModelAndCache(), callback);
  }

  async loadModel() {
    this.model = await tf.loadLayersModel(this.modelURL);
  }
  async loadModelAndCache() {
    this.model = await tf.loadLayersModel(this.modelURL);
    await this.cache();
  }
  async cache() {
    const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
    await this.detectInternal(dummy);
    tf.dispose(dummy);
  }


}

const YOLO = (videoOrOptionsOrCallback, optionsOrCallback, cb) => {
  let video;
  let options = {};
  let callback = cb;

  if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'object' && videoOrOptionsOrCallback.elt instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback.elt; // Handle a p5.js video element
  } else if (typeof videoOrOptionsOrCallback === 'object') {
    options = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'function') {
    callback = videoOrOptionsOrCallback;
  }
  if (typeof optionsOrCallback === 'object') {
    options = optionsOrCallback;
  } else if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback;
  }
  const yoloOptions = {
    ...DEFAULTS,
    ...options,
  };
  const instance = new YOLODetector(video, yoloOptions, callback);
  return callback ? instance : instance.ready;
};
export default YOLO;
