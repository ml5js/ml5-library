// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint max-len: "off" */
/*
Fast Style Transfer
Heavily based out of: https://github.com/zaidalyafeai/Fast-Style-Transfer-Keras-TF.js
*/

import * as tf from '@tensorflow/tfjs';
import { processVideo } from '../utils/imageUtilities';

class StyleTransfer {
  constructor(model, videoOrCallback, cb) {
    this.ready = false;
    this.modelPath = model;
    this.modelReady = false;
    this.model = null;
    this.imageSize = 256;

    let callback;
    if (videoOrCallback instanceof HTMLVideoElement) {
      callback = cb;
      this.video = processVideo(videoOrCallback, this.imageSize, () => {
        this.videoReady = true;
      });
    } else {
      callback = videoOrCallback;
      this.video = null;
    }
    this.loadModel(callback);
  }

  async loadModel(callback) {
    this.model = await tf.loadModel(`${this.modelPath}/model.json`);
    this.modelReady = true;
    callback();
  }

  transfer(inputOrCallback, cb) {
    let input;
    let callback;

    if (inputOrCallback instanceof HTMLVideoElement || inputOrCallback instanceof HTMLImageElement) {
      input = inputOrCallback;
      callback = cb;
    } else {
      input = this.video;
      callback = inputOrCallback;
    }

    if (this.modelReady) {
      const processedImage = StyleTransfer.preprocess(input);
      const prediction = this.model.predict(processedImage);
      const output = StyleTransfer.deprocess(prediction);
      const result = StyleTransfer.tensorToImage(output);
      if (callback) {
        callback(result);
      }
    }

    console.error('The model has not finished loading');
    return false;
  }

  static preprocess(input) {
    return tf.tidy(() => {
      const pixels = tf.fromPixels(input).toFloat();
      const offset = tf.scalar(127.5);
      const normalized = pixels.sub(offset).div(offset);
      const batched = normalized.expandDims(0);
      return batched;
    });
  }

  static deprocess(input) {
    return tf.tidy(() => {
      const offset = tf.scalar(127.5);
      const denormalized = input.mul(offset).add(offset).toInt();
      const reduced = denormalized.squeeze();
      return reduced;
    });
  }

  static tensorToImage(tensor) {
    const [height, width] = tensor.shape;
    const buffer = new Uint8ClampedArray(width * height * 4);
    const imageData = new ImageData(width, height);
    const data = tensor.dataSync();
    let cnt = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pos = ((y * width) + x) * 4;
        buffer[pos] = data[cnt];
        buffer[pos + 1] = data[cnt + 1];
        buffer[pos + 2] = data[cnt + 2];
        buffer[pos + 3] = 255;
        cnt += 3;
      }
    }
    imageData.data.set(buffer);
    return imageData;
  }
}

export default StyleTransfer;
