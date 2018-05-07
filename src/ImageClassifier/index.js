// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image classifier class
*/
/* eslint max-len: ["error", { "code": 180 }] */

import * as tf from '@tensorflow/tfjs';
import ImageAndVideo from './../ImageAndVideo';
import { IMAGENET_CLASSES } from './../utils/IMAGENET_CLASSES';
import { processVideo, imgToTensor } from '../utils/imageUtilities';

const DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
};

const IMAGESIZE = 224;

class ImageClassifier extends ImageAndVideo {
  constructor(video, options = {}, callback = () => {}) {
    super(video, IMAGESIZE);

    this.mobilenet = null;
    this.modelPath = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
    this.topKPredictions = 10;
    this.modelLoaded = false;
    this.waitingPredictions = [];

    // Props for retraining mobilenet
    this.hasAnyTrainedClass = false;
    this.customModel = null;
    this.epochs = options.epochs || DEFAULTS.epochs;
    this.hiddenUnits = options.hiddenUnits || DEFAULTS.hiddenUnits;
    this.numClasses = options.numClasses || DEFAULTS.numClasses;
    this.learningRate = options.learningRate || DEFAULTS.learningRate;
    this.batchSize = options.batchSize || DEFAULTS.batchSize;
    this.isPredicting = false;
    this.mapStringToIndex = [];

    this.loadModel().then((net) => {
      this.modelLoaded = true;
      this.mobilenetModified = net;
      this.waitingPredictions.forEach(i => this.predict(i.imgToPredict, i.num, i.callback));
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

  // Add an image to retrain
  addImage(labelOrInput, labelOrCallback, cb) {
    let imgToAdd;
    let label;
    let callback;

    if (labelOrInput instanceof HTMLImageElement || labelOrInput instanceof HTMLVideoElement) {
      imgToAdd = labelOrInput;
      label = labelOrCallback;
      callback = cb;
    } else {
      imgToAdd = this.video;
      label = labelOrInput;
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
        const prediction = this.mobilenetModified.predict(processedImg);
        const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label], 'int32'), this.numClasses));
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
    }
  }

  // Train
  async train(onProgress) {
    if (!this.hasAnyTrainedClass) {
      throw new Error('Add some examples before training!');
    }

    this.isPredicting = false;

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

    const optimizer = tf.train.adam(this.learningRate);
    this.customModel.compile({ optimizer, loss: 'categoricalCrossentropy' });
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

  /* eslint consistent-return: 0 */
  async predict(inputNumOrCallback, numOrCallback = null, cb = null) {
    let imgToPredict = numOrCallback;
    let numberOfClasses;
    let callback = cb;

    if (typeof inputNumOrCallback === 'function') {
      if (!this.video) {
        this.video = processVideo(inputNumOrCallback, this.imageSize);
      }
      imgToPredict = this.video;
      callback = inputNumOrCallback;
    } else if (inputNumOrCallback instanceof HTMLImageElement) {
      imgToPredict = inputNumOrCallback;
    } else if (inputNumOrCallback instanceof HTMLVideoElement) {
      if (!this.video) {
        this.video = processVideo(inputNumOrCallback, this.imageSize);
      }
      imgToPredict = this.video;
    } else {
      imgToPredict = this.video;
      numberOfClasses = inputNumOrCallback;
      callback = numOrCallback;
    }

    if (!this.modelLoaded) {
      this.waitingPredictions.push({ imgToPredict, num: numberOfClasses || this.topKPredictions, callback });
    } else {
      // If there is no custom model, then run over the original mobilenet
      if (!this.customModel) {
        const logits = tf.tidy(() => {
          const pixels = tf.fromPixels(imgToPredict).toFloat();
          const resized = tf.image.resizeBilinear(pixels, [this.imageSize, this.imageSize]);
          const offset = tf.scalar(127.5);
          const normalized = resized.sub(offset).div(offset);
          const batched = normalized.reshape([1, this.imageSize, this.imageSize, 3]);
          return this.mobilenet.predict(batched);
        });

        const results = await ImageClassifier.getTopKClasses(logits, numberOfClasses || this.topKPredictions, callback);
        return results;
      }

      this.isPredicting = true;
      const predictedClass = tf.tidy(() => {
        const processedImg = imgToTensor(imgToPredict);
        const activation = this.mobilenetModified.predict(processedImg);
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

export default ImageClassifier;
