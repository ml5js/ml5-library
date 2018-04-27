// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Mobilenet Transfer Learning
*/

import * as tf from '@tensorflow/tfjs';

import { processVideo } from '../utils/imageUtilities';
// import * as io from '../utils/io';

const DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
};

class TransferLearning {
  constructor(video, options = {}, callback = () => {}) {
    this.ready = false;
    this.modelPath = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
    this.hasAnyTrainedClass = false;
    this.model = null;
    this.epochs = options.epochs || DEFAULTS.epochs;
    this.hiddenUnits = options.hiddenUnits || DEFAULTS.hiddenUnits;
    this.numClasses = options.numClasses || DEFAULTS.numClasses;
    this.learningRate = options.learningRate || DEFAULTS.learningRate;
    this.batchSize = options.batchSize || DEFAULTS.batchSize;
    this.isPredicting = false;
    this.loadModel().then((net) => {
      this.ready = true;
      callback();
      this.mobilenet = net;
    });

    if (video instanceof HTMLVideoElement) {
      this.video = processVideo(video, '224');
    }
  }

  async loadModel() {
    const mobilenet = await tf.loadModel(this.modelPath);
    const layer = mobilenet.getLayer('conv_pw_13_relu');

    if (this.video) {
      tf.tidy(() => mobilenet.predict(TransferLearning.imgToTensor(this.video))); // Warm up
    }

    return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
  }

  addImage(label, callback = () => {}, input = null) {
    if (this.ready) {
      tf.tidy(() => {
        let processedImg;

        if (input) {
          processedImg = TransferLearning.imgToTensor(input);
        } else {
          processedImg = TransferLearning.imgToTensor(this.video);
        }

        const prediction = this.mobilenet.predict(processedImg);

        const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]), this.numClasses));

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

      callback();
    }
  }

  async train(onProgress) {
    if (!this.hasAnyTrainedClass) {
      throw new Error('Add some examples before training!');
    }

    this.isPredicting = false;

    this.model = tf.sequential({
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
    this.model.compile({ optimizer, loss: 'categoricalCrossentropy' });
    const batchSize = Math.floor(this.xs.shape[0] * this.batchSize);
    if (!(batchSize > 0)) {
      throw new Error('Batch size is 0 or NaN. Please choose a non-zero fraction.');
    }

    this.model.fit(this.xs, this.ys, {
      batchSize,
      epochs: this.epochs,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          onProgress(logs.loss.toFixed(5));
          await tf.nextFrame();
        },
      },
    });
  }

  async predict(input, callback = () => {}) {
    this.isPredicting = true;

    const predictedClass = tf.tidy(() => {
      const processedImg = TransferLearning.imgToTensor(input);
      const activation = this.mobilenet.predict(processedImg);
      const predictions = this.model.predict(activation);
      return predictions.as1D().argMax();
    });

    const classId = (await predictedClass.data())[0];
    callback(classId);

    await tf.nextFrame();
  }

  static cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  static imgToTensor(input) {
    return tf.tidy(() => {
      const img = tf.fromPixels(input);
      const croppedImage = TransferLearning.cropImage(img);
      const batchedImage = croppedImage.expandDims(0);
      return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
  }
}

export default TransferLearning;
