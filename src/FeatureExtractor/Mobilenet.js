// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
A class that extract features from Mobilenet
*/

import * as tf from '@tensorflow/tfjs';
import Video from './../utils/Video';
import { IMAGENET_CLASSES } from './../utils/IMAGENET_CLASSES';
import { imgToTensor } from '../utils/imageUtilities';

const IMAGESIZE = 224;
const DEFAULTS = {
  version: 1,
  alpha: 1.0,
  topk: 3,
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
};

class Mobilenet {
  constructor(options, callback) {
    this.mobilenet = null;
    this.modelPath = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
    this.topKPredictions = 10;
    this.modelLoaded = false;
    this.hasAnyTrainedClass = false;
    this.customModel = null;
    this.epochs = options.epochs || DEFAULTS.epochs;
    this.hiddenUnits = options.hiddenUnits || DEFAULTS.hiddenUnits;
    this.numClasses = options.numClasses || DEFAULTS.numClasses;
    this.learningRate = options.learningRate || DEFAULTS.learningRate;
    this.batchSize = options.batchSize || DEFAULTS.batchSize;
    this.isPredicting = false;
    this.mapStringToIndex = [];
    this.usageType = null;

    this.loadModel().then((net) => {
      this.modelLoaded = true;
      this.mobilenetFeatures = net;
      callback();
    });
  }

  async loadModel() {
    this.mobilenet = await tf.loadModel(this.modelPath);
    const layer = this.mobilenet.getLayer('conv_pw_13_relu');
    if (this.video) {
      tf.tidy(() => this.mobilenet.predict(imgToTensor(this.video))); // Warm up
    }
    return tf.model({ inputs: this.mobilenet.inputs, outputs: layer.output });
  }

  classification(video, callback) {
    this.usageType = 'classifier';
    return this.loadVideo(video, callback);
  }

  regression(video, callback) {
    this.usageType = 'regressor';
    return this.loadVideo(video, callback);
  }

  loadVideo(video, callback = () => {}) {
    let inputVideo = null;

    if (video instanceof HTMLVideoElement) {
      inputVideo = video;
    } else if (typeof video === 'object' && video.elt instanceof HTMLVideoElement) {
      inputVideo = video.elt;
    }

    if (inputVideo) {
      const vid = new Video(inputVideo, IMAGESIZE);
      vid.loadVideo().then(async () => {
        this.video = vid.video;
        callback();
      });
    }

    return this;
  }

  addImage(inputOrLabel, labelOrCallback, cb = () => {}) {
    let imgToAdd;
    let label;
    let callback = cb;

    if (inputOrLabel instanceof HTMLImageElement || inputOrLabel instanceof HTMLVideoElement) {
      imgToAdd = inputOrLabel;
    } else if (typeof inputOrLabel === 'object' && (inputOrLabel.elt instanceof HTMLImageElement || inputOrLabel.elt instanceof HTMLVideoElement)) {
      imgToAdd = inputOrLabel;
    } else if (typeof inputOrLabel === 'string' || typeof inputOrLabel === 'number') {
      imgToAdd = this.video;
      label = inputOrLabel;
    }

    if (typeof labelOrCallback === 'string' || typeof labelOrCallback === 'number') {
      label = labelOrCallback;
    } else if (typeof labelOrCallback === 'function') {
      callback = labelOrCallback;
    }

    if (typeof label === 'string') {
      if (!this.mapStringToIndex.includes(label)) {
        label = this.mapStringToIndex.push(label) - 1;
      } else {
        label = this.mapStringToIndex.indexOf(label);
      }
    }

    if (this.modelLoaded) {
      tf.tidy(() => {
        const processedImg = imgToTensor(imgToAdd);
        const prediction = this.mobilenetFeatures.predict(processedImg);

        let y;
        if (this.usageType === 'classifier') {
          y = tf.tidy(() => tf.oneHot(tf.tensor1d([label], 'int32'), this.numClasses));
        } else if (this.usageType === 'regressor') {
          y = tf.tidy(() => tf.tensor2d([[label]]));
        }

        if (this.xs == null) {
          this.xs = tf.keep(prediction);
          this.ys = tf.keep(y);
          this.hasAnyTrainedClass = true;
        } else {
          const oldX = this.xs;
          this.xs = tf.keep(oldX.concat(prediction, 0));
          const oldY = this.ys;
          this.ys = tf.keep(oldY.concat(y, 0));
          oldX.dispose();
          oldY.dispose();
          y.dispose();
        }
      });
      if (callback) {
        callback();
      }
    } else {
      console.warn('The model is not loaded yet.');
    }
  }

  async train(onProgress) {
    if (!this.hasAnyTrainedClass) {
      throw new Error('Add some examples before training!');
    }

    this.isPredicting = false;

    if (this.usageType === 'classifier') {
      this.loss = 'categoricalCrossentropy';
      this.customModel = tf.sequential({
        layers: [
          tf.layers.flatten({ inputShape: [7, 7, 256] }),
          tf.layers.dense({
            units: this.hiddenUnits,
            activation: 'relu',
            kernelInitializer: 'varianceScaling',
            useBias: true,
          }),
          tf.layers.dense({
            units: this.numClasses,
            kernelInitializer: 'varianceScaling',
            useBias: false,
            activation: 'softmax',
          }),
        ],
      });
    } else if (this.usageType === 'regressor') {
      this.loss = 'meanSquaredError';
      this.customModel = tf.sequential({
        layers: [
          tf.layers.flatten({ inputShape: [7, 7, 256] }),
          tf.layers.dense({
            units: this.hiddenUnits,
            activation: 'relu',
            kernelInitializer: 'varianceScaling',
            useBias: true,
          }),
          tf.layers.dense({
            units: 1,
            useBias: false,
            kernelInitializer: 'Zeros',
            activation: 'linear',
          }),
        ],
      });
    }

    const optimizer = tf.train.adam(this.learningRate);
    this.customModel.compile({ optimizer, loss: this.loss });
    const batchSize = Math.floor(this.xs.shape[0] * this.batchSize);
    if (!(batchSize > 0)) {
      throw new Error('Batch size is 0 or NaN. Please choose a non-zero fraction.');
    }

    this.customModel.fit(this.xs, this.ys, {
      batchSize,
      epochs: this.epochs,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          onProgress(logs.loss.toFixed(5));
          await tf.nextFrame();
        },
        onTrainEnd: () => onProgress(null),
      },
    });
  }

  /* eslint max-len: ["error", { "code": 180 }] */
  async classify(inputOrCallback, cb = null) {
    if (this.usageType === 'classifier') {
      let imgToPredict;
      let callback;

      if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
        imgToPredict = inputOrCallback;
      } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement || inputOrCallback.elt instanceof HTMLVideoElement)) {
        imgToPredict = inputOrCallback.elt; // p5.js image element
      } else if (typeof inputOrCallback === 'function') {
        imgToPredict = this.video;
        callback = inputOrCallback;
      }

      if (typeof cb === 'function') {
        callback = cb;
      }

      this.isPredicting = true;
      const predictedClass = tf.tidy(() => {
        const processedImg = imgToTensor(imgToPredict);
        const activation = this.mobilenetFeatures.predict(processedImg);
        const predictions = this.customModel.predict(activation);
        return predictions.as1D().argMax();
      });
      let classId = (await predictedClass.data())[0];
      await tf.nextFrame();
      if (callback) {
        if (this.mapStringToIndex.length > 0) {
          classId = this.mapStringToIndex[classId];
        }
        callback(classId);
      }
    } else {
      console.warn('Mobilenet Feature Extraction has not been set to be a classifier.');
    }
  }

  /* eslint max-len: ["error", { "code": 180 }] */
  async predict(inputOrCallback, cb = null) {
    if (this.usageType === 'regressor') {
      let imgToPredict;
      let callback;

      if (inputOrCallback instanceof HTMLImageElement || inputOrCallback instanceof HTMLVideoElement) {
        imgToPredict = inputOrCallback;
      } else if (typeof inputOrCallback === 'object' && (inputOrCallback.elt instanceof HTMLImageElement || inputOrCallback.elt instanceof HTMLVideoElement)) {
        imgToPredict = inputOrCallback.elt; // p5.js image element
      } else if (typeof inputOrCallback === 'function') {
        imgToPredict = this.video;
        callback = inputOrCallback;
      }

      if (typeof cb === 'function') {
        callback = cb;
      }

      this.isPredicting = true;
      const predictedClass = tf.tidy(() => {
        const processedImg = imgToTensor(imgToPredict);
        const activation = this.mobilenetFeatures.predict(processedImg);
        const predictions = this.customModel.predict(activation);
        return predictions.as1D();
      });
      const prediction = (await predictedClass.data());
      predictedClass.dispose();
      await tf.nextFrame();
      if (callback) {
        callback(prediction[0]);
      }
    } else {
      console.warn('Mobilenet Feature Extraction has not been set to be a regressor.');
    }
  }

  // Static Method: get top k classes for mobilenet
  static async getTopKClasses(logits, topK, callback) {
    const values = await logits.data();
    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i += 1) {
      valuesAndIndices.push({ value: values[i], index: i });
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
        className: IMAGENET_CLASSES[topkIndices[i]],
        probability: topkValues[i],
      });
    }

    await tf.nextFrame();

    if (callback) {
      callback(topClassesAndProbs);
    }
    return topClassesAndProbs;
  }
}

export default Mobilenet;
