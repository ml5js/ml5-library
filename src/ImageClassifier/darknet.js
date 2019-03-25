// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import IMAGENET_CLASSES_DARKNET from '../utils/IMAGENET_CLASSES_DARKNET';

const DEFAULTS = {
  DARKNET_URL: 'https://rawgit.com/ml5js/ml5-data-and-models/master/models/darknetclassifier/darknetreference/model.json',
  DARKNET_TINY_URL: 'https://rawgit.com/ml5js/ml5-data-and-models/master/models/darknetclassifier/darknettiny/model.json',
  IMAGE_SIZE_DARKNET: 256,
  IMAGE_SIZE_DARKNET_TINY: 224,
};

async function getTopKClasses(logits, topK) {
  const values = await logits.data();
  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i += 1) {
    valuesAndIndices.push({
      value: values[i],
      index: i,
    });
  }
  valuesAndIndices.sort((a, b) => b.value - a.value);

  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i += 1) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i += 1) {
    topClassesAndProbs.push({
      className: IMAGENET_CLASSES_DARKNET[topkIndices[i]],
      probability: topkValues[i],
    });
  }
  return topClassesAndProbs;
}

function preProcess(img, size) {
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
  const normalized = image.toFloat().div(tf.scalar(255));
  let resized = normalized;
  if (normalized.shape[0] !== size || normalized.shape[1] !== size) {
    const alignCorners = true;
    resized = tf.image.resizeBilinear(normalized, [size, size], alignCorners);
  }
  const batched = resized.reshape([1, size, size, 3]);
  return batched;
}

export class Darknet {
  constructor(version) {
    this.version = version;
    switch (this.version) {
      case 'reference':
        this.imgSize = DEFAULTS.IMAGE_SIZE_DARKNET;
        break;
      case 'tiny':
        this.imgSize = DEFAULTS.IMAGE_SIZE_DARKNET_TINY;
        break;
      default:
        break;
    }
  }

  async load() {
    switch (this.version) {
      case 'reference':
        this.model = await tf.loadGraphModel(DEFAULTS.DARKNET_URL);
        break;
      case 'tiny':
        this.model = await tf.loadGraphModel(DEFAULTS.DARKNET_TINY_URL);
        break;
      default:
        break;
    }

    // Warmup the model.
    const result = tf.tidy(() => this.model.predict(tf.zeros([1, this.imgSize, this.imgSize, 3])));
    await result.data();
    result.dispose();
  }

  async classify(img, topk = 3) {
    const logits = tf.tidy(() => {
      const imgData = preProcess(img, this.imgSize);
      const predictions = this.model.predict(imgData);
      return tf.softmax(predictions);
    });
    const classes = await getTopKClasses(logits, topk);
    logits.dispose();
    return classes;
  }
}

export async function load(version) {
  if (version !== 'reference' && version !== 'tiny') {
    throw new Error('Please select a version: darknet-reference or darknet-tiny');
  }

  const darknet = new Darknet(version);
  await darknet.load();
  return darknet;
}
