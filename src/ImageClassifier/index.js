// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image classifier class
*/
/* eslint max-len: ["error", { "code": 180 }] */

import * as tf from '@tensorflow/tfjs';
import Video from './../utils/Video';
import { IMAGENET_CLASSES } from './../utils/IMAGENET_CLASSES';
import { processVideo, imgToTensor } from '../utils/imageUtilities';

const IMAGESIZE = 224;

class ImageClassifier extends Video {
  constructor(model, videoOrCallback, cb = () => {}) {
    super(videoOrCallback, IMAGESIZE);

    let callback;
    if (typeof videoOrCallback === 'function') {
      callback = cb;
    } else {
      callback = cb;
    }

    this.modelName = model;
    this.model = null;
    this.topKPredictions = 10;
    if (this.modelName === 'Mobilenet' || this.modelName === 'MobileNet' || this.modelName === 'mobilenet') {
      this.modelPath = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
    } else {
      console.error('Please specify a model to use. E.g: "Mobilenet"');
    }

    // Load the model and video
    if (this.videoElt) {
      this.loadVideo().then(() => {
        this.videoReady = true;
        this.loadModel().then((net) => {
          this.modelLoaded = true;
          this.mobilenetFeatures = net;
          callback();
        });
      });
    } else {
      this.loadModel().then((net) => {
        this.modelLoaded = true;
        this.mobilenetFeatures = net;
        callback();
      });
    }
  }

  async loadModel() {
    this.mobilenet = await tf.loadModel(this.modelPath);
    const layer = this.mobilenet.getLayer('conv_pw_13_relu');

    if (this.videoReady && this.video) {
      tf.tidy(() => this.mobilenet.predict(imgToTensor(this.video))); // Warm up
    }

    return tf.model({ inputs: this.mobilenet.inputs, outputs: layer.output });
  }

  /* eslint consistent-return: 0 */
  async predict(inputNumOrCallback, numOrCallback = null, cb = null) {
    let imgToPredict = this.video;
    let numberOfClasses = 10;
    let callback;

    if (typeof inputNumOrCallback === 'function') {
      imgToPredict = this.video;
      callback = inputNumOrCallback;
    } else if (inputNumOrCallback instanceof HTMLImageElement) {
      imgToPredict = inputNumOrCallback;
    } else if (typeof inputNumOrCallback === 'object' && inputNumOrCallback.elt instanceof HTMLImageElement) {
      imgToPredict = inputNumOrCallback.elt;
    } else if (inputNumOrCallback instanceof HTMLVideoElement) {
      if (!this.video) {
        this.video = processVideo(inputNumOrCallback, this.imageSize);
      }
      imgToPredict = this.video;
    } else if (typeof numOrCallback === 'number') {
      imgToPredict = this.video;
      numberOfClasses = inputNumOrCallback;
    }

    if (typeof numOrCallback === 'function') {
      callback = numOrCallback;
    } else if (typeof numOrCallback === 'number') {
      numberOfClasses = numOrCallback;
    }

    if (typeof cb === 'function') {
      callback = cb;
    }

    // If there is no custom model, then run overcla the original mobilenet
    if (!this.customModel) {
      const logits = tf.tidy(() => {
        const pixels = tf.fromPixels(imgToPredict).toFloat();
        const resized = tf.image.resizeBilinear(pixels, [this.size, this.size]);
        const offset = tf.scalar(127.5);
        const normalized = resized.sub(offset).div(offset);
        const batched = normalized.reshape([1, this.size, this.size, 3]);
        return this.mobilenet.predict(batched);
      });
      const results = await ImageClassifier.getTopKClasses(logits, numberOfClasses || this.topKPredictions, callback);
      return results;
    }
    // Else, run over the custom model using mobilenet's feautures
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
