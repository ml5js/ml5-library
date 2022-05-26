// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import { getTopKClassesFromTensor } from '../utils/gettopkclasses';
import DOODLENET_CLASSES from '../utils/DOODLENET_CLASSES';
import { toTensor } from '../utils/imageUtilities';
import { modelInputShape } from '../utils/tensorInput';

const DEFAULTS = {
  DOODLENET_URL: 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/models/doodlenet/model.json',
  IMAGE_SIZE_DOODLENET: 28,
};

/**
 * @param {tf.Tensor4D} image
 * @param {number} size
 * @return {tf.Tensor4D}
 */
function preProcess(image, size) {
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
  async load() {
    this.model = await tf.loadLayersModel(DEFAULTS.DOODLENET_URL);

    const inputShape = modelInputShape(this.model);

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
  async classify(img, topk = 10) {
    const logits = tf.tidy(() => {
      const imgData = preProcess(toTensor(img).expandDims(0), DEFAULTS.IMAGE_SIZE_DOODLENET);
      return this.model.predict(imgData);
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
