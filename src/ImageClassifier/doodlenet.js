// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import { getTopKClassesFromTensor } from '../utils/gettopkclasses';
import DOODLENET_CLASSES from '../utils/DOODLENET_CLASSES';
import { isInstanceOfSupportedElement } from "../utils/imageUtilities";

const DEFAULTS = {
  DOODLENET_URL: 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/models/doodlenet/model.json',
  IMAGE_SIZE_DOODLENET: 28,
};

function preProcess(img, size) {
  let image;
  if (!(img instanceof tf.Tensor)) {
    if (isInstanceOfSupportedElement(img)) {
      image = tf.browser.fromPixels(img);
    } else if (typeof img === 'object' && isInstanceOfSupportedElement(img.elt)) {
      image = tf.browser.fromPixels(img.elt); // Handle p5.js image, video and canvas.
    }
  } else {
    image = img;
  }
  const normalized = tf.scalar(1).sub(image.toFloat().div(tf.scalar(255)));
  let resized = normalized;
  if (normalized.shape[0] !== size || normalized.shape[1] !== size) {
    resized = tf.image.resizeBilinear(normalized, [size, size]);
  }

  const [r, g, b] = tf.split(resized, 3, 3);
  const gray = (r.add(g).add(b)).div(tf.scalar(3)).floor(); // Get average r,g,b color value and round to 0 or 1
  const batched = gray.reshape([1, size, size, 1]);
  return batched;
}

export class Doodlenet {
  constructor() {
    this.imgSize = DEFAULTS.IMAGE_SIZE_DOODLENET;
  }

  async load() {
    this.model = await tf.loadLayersModel(DEFAULTS.DOODLENET_URL);

    // Warmup the model.
    const result = tf.tidy(() => this.model.predict(tf.zeros([1, this.imgSize, this.imgSize, 1])));
    await result.data();
    result.dispose();
  }

  async classify(img, topk = 10) {
    const logits = tf.tidy(() => {
      const imgData = preProcess(img, this.imgSize);
      const predictions = this.model.predict(imgData);
      return predictions;
    });
    const classes = await getTopKClassesFromTensor(logits, topk, DOODLENET_CLASSES);
    logits.dispose();
    return classes;
  }
}

export async function load() {
  const doodlenet = new Doodlenet();
  await doodlenet.load();
  return doodlenet;
}
