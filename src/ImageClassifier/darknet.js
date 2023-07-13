// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from "@tensorflow/tfjs";
import { getTopKClassesFromTensor } from "../utils/gettopkclasses";
import IMAGENET_CLASSES_DARKNET from "../utils/IMAGENET_CLASSES_DARKNET";
import ImageProcessor from '../utils/preProcess';
import { modelInputShape } from '../utils/tensorInput';

// TODO: combine more with doodlenet?

// Note: object keys must match version names.
const MODEL_URLS = {
  reference:
    "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/models/darknetclassifier/darknetreference/model.json",
  tiny:
    "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/models/darknetclassifier/darknettiny/model.json",
};

export class Darknet {
  constructor(version = 'tiny') {
    this.version = version;
    this.modelUrl = MODEL_URLS[version];
    if (!this.modelUrl) {
      throw new Error(`Invalid Darknet version ${version}. Version must be one of: ${Object.keys(MODEL_URLS).join(', ')}.`);
    }
  }

  async load() {
    // Load the model.
    this.model = await tf.loadLayersModel(this.modelUrl);

    // Can get the image size from the model.
    const inputShape = modelInputShape(this.model);

    // Create an ImageProcessor instance to prepare inputs.
    this.processor = new ImageProcessor({
      inputShape,
      inputRange: [0, 1]
    });

    // Warmup the model.
    const result = tf.tidy(() => this.model.predict(tf.zeros(inputShape)));
    await result.data();
    result.dispose();
  }

  /**
   * @param {tf.Tensor3D | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} img
   * @param {number} topk
   * @return {Promise<{ className: string, probability: number }[]>}
   */
  async classify(img, topk = 3) {
    const logits = tf.tidy(() => {
      const imgData = this.processor.preProcess(img);
      const predictions = this.model.predict(imgData);
      return tf.softmax(predictions);
    });
    const classes = await getTopKClassesFromTensor(logits, topk, IMAGENET_CLASSES_DARKNET);
    logits.dispose();
    return classes;
  }
}

export async function load(modelConfig) {
  const darknet = new Darknet(modelConfig.version);
  await darknet.load();
  return darknet;
}
