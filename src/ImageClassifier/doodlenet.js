// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import getTopKClasses from '../utils/gettopkclasses';
import DOODLENET_CLASSES from '../utils/DOODLENET_CLASSES';

const DEFAULTS = {
  DOODLENET_URL: 'https://rawgit.com/ml5js/ml5-data-and-models/master/models/doodlenet/model.json',
  IMAGE_SIZE_DOODLENET: 28,
};

function preProcess(img, size) {
  let image;
  if (!(img instanceof tf.Tensor)) {
    if (img instanceof HTMLImageElement || img instanceof HTMLVideoElement || img instanceof HTMLCanvasElement) {
      image = tf.browser.fromPixels(img);
    } else if (typeof img === 'object' && (img.elt instanceof HTMLImageElement || img.elt instanceof HTMLVideoElement || img.elt instanceof HTMLCanvasElement)) {
      image = tf.browser.fromPixels(img.elt); // Handle p5.js image and video.
    }
  } else {
    image = img;
  }
  const normalized = tf.scalar(1).sub(image.toFloat().div(tf.scalar(255)));
  let resized = normalized;
  if (normalized.shape[0] !== size || normalized.shape[1] !== size) {
    resized = tf.image.resizeBilinear(normalized, [size, size]);
  }
  const r = tf.split(resized, 3, 2)[0];
  const batched = r.reshape([1, size, size, 1]);
  return batched;
}

export class Doodlenet {
  constructor() {
    this.imgSize = DEFAULTS.IMAGE_SIZE_DOODLENET;
  }

  async load() {
    this.model = await tf.loadLayersModel(DEFAULTS.DOODLENET_URL);
  }

  async classify(img, topk = 10) {
    const logits = tf.tidy(() => {
      const imgData = preProcess(img, this.imgSize);
      const predictions = this.model.predict(imgData);
      return predictions;
    });
    const classes = await getTopKClasses(logits, topk, DOODLENET_CLASSES);
    logits.dispose();
    return classes;
  }
}

export async function load() {
  const doodlenet = new Doodlenet();
  await doodlenet.load();
  return doodlenet;
}
