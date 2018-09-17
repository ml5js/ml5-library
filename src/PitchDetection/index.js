// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
  Crepe Pitch Detection model
  Based on https://github.com/marl/crepe/tree/gh-pages
  Original model and code: https://marl.github.io/crepe/crepe.js
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';

class PitchDetection {
  constructor(model, audioContext, stream, callback) {
    this.model = model;
    this.audioContext = audioContext;
    this.stream = stream;
    this.frequency = null;
    this.ready = callCallback(this.loadModel(model), callback);
  }

  async loadModel(model) {
    this.model = await tf.loadModel(`${model}/model.json`);
    if (this.audioContext) {
      await this.processStream();
    } else {
      throw new Error('Could not access microphone - getUserMedia not available');
    }
    return this;
  }

  async processStream() {
    await tf.nextFrame();

    const mic = this.audioContext.createMediaStreamSource(this.stream);
    const minBufferSize = (this.audioContext.sampleRate / 16000) * 1024;
    let bufferSize = 4;
    while (bufferSize < minBufferSize) bufferSize *= 2;

    const scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    scriptNode.onaudioprocess = this.processMicrophoneBuffer.bind(this);
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);

    mic.connect(scriptNode);
    scriptNode.connect(gain);
    gain.connect(this.audioContext.destination);

    if (this.audioContext.state !== 'running') {
      console.warn('User gesture needed to start AudioContext, please click');
    }
  }

  async processMicrophoneBuffer(event) {
    await tf.nextFrame();
    this.results = {};
    const centMapping = tf.add(tf.linspace(0, 7180, 360), tf.tensor(1997.3794084376191));
    PitchDetection.resample(event.inputBuffer, (resampled) => {
      tf.tidy(() => {
        this.running = true;
        const frame = tf.tensor(resampled.slice(0, 1024));
        const zeromean = tf.sub(frame, tf.mean(frame));
        const framestd = tf.tensor(tf.norm(zeromean).dataSync() / Math.sqrt(1024));
        const normalized = tf.div(zeromean, framestd);
        const input = normalized.reshape([1, 1024]);
        const activation = this.model.predict([input]).reshape([360]);
        const confidence = activation.max().dataSync()[0];
        const center = activation.argMax().dataSync()[0];
        this.results.confidence = confidence.toFixed(3);

        const start = Math.max(0, center - 4);
        const end = Math.min(360, center + 5);
        const weights = activation.slice([start], [end - start]);
        const cents = centMapping.slice([start], [end - start]);

        const products = tf.mul(weights, cents);
        const productSum = products.dataSync().reduce((a, b) => a + b, 0);
        const weightSum = weights.dataSync().reduce((a, b) => a + b, 0);
        const predictedCent = productSum / weightSum;
        const predictedHz = 10 * (2 ** (predictedCent / 1200.0));

        const frequency = (confidence > 0.5) ? predictedHz : null;
        this.frequency = frequency;
      });
    });
  }

  async getPitch(callback) {
    await this.ready;
    await tf.nextFrame();
    const { frequency } = this;
    if (callback) {
      callback(undefined, frequency);
    }
    return frequency;
  }

  static resample(audioBuffer, onComplete) {
    const interpolate = (audioBuffer.sampleRate % 16000 !== 0);
    const multiplier = audioBuffer.sampleRate / 16000;
    const original = audioBuffer.getChannelData(0);
    const subsamples = new Float32Array(1024);
    for (let i = 0; i < 1024; i += 1) {
      if (!interpolate) {
        subsamples[i] = original[i * multiplier];
      } else {
        const left = Math.floor(i * multiplier);
        const right = left + 1;
        const p = (i * multiplier) - left;
        subsamples[i] = (((1 - p) * original[left]) + (p * original[right]));
      }
    }
    onComplete(subsamples);
  }
}

const pitchDetection = (modelPath = './', context, stream, callback) => new PitchDetection(modelPath, context, stream, callback);

export default pitchDetection;
