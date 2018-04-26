/*
Crepe Pitch Detection model
https://github.com/marl/crepe/tree/gh-pages
https://marl.github.io/crepe/crepe.js
*/

import * as tf from '@tensorflow/tfjs';

class Crepe {
  // in here are the functions to make exposed
  constructor(audioContext, stream) {
    this.audioContext = audioContext;
    this.stream = stream;
    this.initTF();
  }

  async initTF() {
    try {
      console.log('Loading Keras model...');
      this.model = await tf.loadModel('model/model.json');
      console.log('Model loading complete');
    } catch (e) {
      console.error(e);
    }
    this.initAudio();
  }

  // perform resampling the audio to 16000 Hz, on which the model is trained.
  // setting a sample rate in AudioContext is not supported by most browsers at the moment.
  resample(audioBuffer, onComplete) {
    const interpolate = (audioBuffer.sampleRate % 16000 !== 0);
    const multiplier = audioBuffer.sampleRate / 16000;
    const original = audioBuffer.getChannelData(0);
    const subsamples = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      if (!interpolate) {
        subsamples[i] = original[i * multiplier];
      } else {
        // simplistic, linear resampling
        const left = Math.floor(i * multiplier);
        const right = left + 1;
        const p = i * multiplier - left;
        subsamples[i] = (((1 - p) * original[left]) + (p * original[right]));
      }
    }
    onComplete(subsamples);
  }

  processMicrophoneBuffer(event) {
    this.results = {};
    // bin number -> cent value mapping
    const centMapping = tf.add(tf.linspace(0, 7180, 360), tf.tensor(1997.3794084376191));
    this.resample(event.inputBuffer, (resampled) => {
      tf.tidy(() => {
        this.running = true;

        // run the prediction on the model
        const frame = tf.tensor(resampled.slice(0, 1024));
        const zeromean = tf.sub(frame, tf.mean(frame));
        const framestd = tf.tensor(tf.norm(zeromean).dataSync()/Math.sqrt(1024));
        const normalized = tf.div(zeromean, framestd);
        const input = normalized.reshape([1, 1024]);
        const activation = this.model.predict([input]).reshape([360]);

        // the confidence of voicing activity and the argmax bin
        const confidence = activation.max().dataSync()[0];
        const center = activation.argMax().dataSync()[0];
        this.results.confidence = confidence.toFixed(3);

        // slice the local neighborhood around the argmax bin
        const start = Math.max(0, center - 4);
        const end = Math.min(360, center + 5);
        const weights = activation.slice([start], [end - start]);
        const cents = centMapping.slice([start], [end - start]);

        // take the local weighted average to get the predicted pitch
        const products = tf.mul(weights, cents);
        const productSum = products.dataSync().reduce((a, b) => a + b, 0);
        const weightSum = weights.dataSync().reduce((a, b) => a + b, 0);
        const predictedCent = productSum / weightSum;
        const predictedHz = 10 * Math.pow(2, predictedCent / 1200.0);

        // update
        let result = (confidence > 0.5) ? predictedHz.toFixed(3) + ' Hz' : 'no voice';
        const strlen = result.length;
        for (let i = 0; i < 11 - strlen; i++) result = result;
        this.results.result = result;
      });
    });
  }

  getResults() {
    return this.results;
  }

  processStream(stream) {
    console.log('Setting up AudioContext ...');
    console.log('Audio context sample rate = ' + this.audioContext.sampleRate);
    const mic = this.audioContext.createMediaStreamSource(stream);

    // We need the buffer size that is a power of two
    // and is longer than 1024 samples when resampled to 16000 Hz.
    // In most platforms where the sample rate is 44.1 kHz or 48 kHz,
    // this will be 4096, giving 10-12 updates/sec.
    const minBufferSize = this.audioContext.sampleRate / 16000 * 1024;
    for (var bufferSize = 4; bufferSize < minBufferSize; bufferSize *= 2);
    console.log('Buffer size = ' + bufferSize);
    const scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    scriptNode.onaudioprocess = this.processMicrophoneBuffer.bind(this);
    // It seems necessary to connect the stream to a sink
    // for the pipeline to work, contrary to documentataions.
    // As a workaround, here we create a gain node with zero gain,
    // and connect temp to the system audio output.
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);

    mic.connect(scriptNode);
    scriptNode.connect(gain);
    gain.connect(this.audioContext.destination);

    if (this.audioContext.state === 'running') {
      console.log('Running ...');
    } else {
      console.error('User gesture needed to start AudioContext, please click');
      // user gesture (like click) is required to start AudioContext, in some browser versions
      // status('<a href="javascript:crepe.resume();" style="color:red;">*
      // Click here to start the demo *</a>')
    }
  }

  initAudio() {
    if (this.audioContext) {
      console.log('Initializing audio');
      try { 
        this.processStream(this.stream);
      } catch(e) {
        console.error('Error: Could not access microphone - ', e);
      }
    } else {
      console.error('Could not access microphone - getUserMedia not available');
    }
  }
}

export default Crepe;
