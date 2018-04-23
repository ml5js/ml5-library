/*
Crepe Pitch Detection model
https://github.com/marl/crepe/tree/gh-pages
https://marl.github.io/crepe/crepe.js
*/

// can replace audio processing with
// https://p5js.org/reference/#/p5/createCapture

import * as tf from '@tensorflow/tfjs';

class Crepe {
  // in here are the functions to make exposed
  constructor() {
    this.audioContext;
    this.running = false;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.srate = this.audioContext.sampleRate;
    } catch (e) {
      console.log('Could not instantiate AudioContext: ' + e.message);
      //throw e;
    }

    console.log(this.audioContext);
    this.initTF(this.audioContext);
    console.log('int the class', this);
  }

  async initTF() {
    try {
      console.log('Loading Keras model...');
      window.model = await tf.loadModel('model/model.json');
      console.log('Model loading complete');
    } catch (e) {
      console.log('Error');
      // throw error(e);
    }
    this.initAudio(this.audioContext);
  }


  // perform resampling the audio to 16000 Hz, on which the model is trained.
  // setting a sample rate in AudioContext is not supported by most browsers at the moment.
  resample(audioBuffer, onComplete) {
    console.log('resample ', this);
    const interpolate = (audioBuffer.sampleRate % 16000 != 0);
    const multiplier = audioBuffer.sampleRate / 16000;
    const original = audioBuffer.getChannelData(0);
    const subsamples = new Float32Array(1024);
    for (var i = 0; i < 1024; i++) {
      if (!interpolate) {
        subsamples[i] = original[i * multiplier];
      } else {
        // simplistic, linear resampling
        var left = Math.floor(i * multiplier);
        var right = left + 1;
        var p = i * multiplier - left;
        subsamples[i] = (1 - p) * original[left] + p * original[right];
      }
    }
    onComplete(subsamples);
  }

  process_microphone_buffer(event) {

    // bin number -> cent value mapping
    const cent_mapping = tf.add(tf.linspace(0, 7180, 360), tf.tensor(1997.3794084376191));
    console.log('from process mic', this);
    this.resample(event.inputBuffer, (resampled) => {
      tf.tidy(() => {
        this.running = true;

        // run the prediction on the model
        const frame = tf.tensor(resampled.slice(0, 1024));
        const zeromean = tf.sub(frame, tf.mean(frame));
        const framestd = tf.tensor(tf.norm(zeromean).dataSync()/Math.sqrt(1024));
        const normalized = tf.div(zeromean, framestd);
        const input = normalized.reshape([1, 1024]);
        const activation = model.predict([input]).reshape([360]);

        // the confidence of voicing activity and the argmax bin
        const confidence = activation.max().dataSync()[0];
        const center = activation.argMax().dataSync()[0];
        console.log(confidence.toFixed(3));

        // slice the local neighborhood around the argmax bin
        const start = Math.max(0, center - 4);
        const end = Math.min(360, center + 5);
        const weights = activation.slice([start], [end - start]);
        const cents = cent_mapping.slice([start], [end - start]);

        // take the local weighted average to get the predicted pitch
        const products = tf.mul(weights, cents);
        const productSum = products.dataSync().reduce((a, b) => a + b, 0);
        const weightSum = weights.dataSync().reduce((a, b) => a + b, 0);
        const predicted_cent = productSum / weightSum;
        const predicted_hz = 10 * Math.pow(2, predicted_cent / 1200.0);

        // update the UI and the activation plot
        var result = (confidence > 0.5) ? predicted_hz.toFixed(3) + ' Hz' : 'no voice';
        var strlen = result.length;
        for (var i = 0; i < 11 - strlen; i++) result = result;
          console.log('estimated pitch', result);
        //this.updateActivation(activation.dataSync());
      });
    });
  }




  initAudio(audioContext) {
    if (!navigator.getUserMedia) {
      console.log('no navigator get user media');
      if (navigator.mediaDevices) {
        navigator.getUserMedia = navigator.mediaDevices.getUserMedia;
      } else {
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      }
    }
    if (navigator.getUserMedia) {
      console.log('Initializing audio');
      navigator.getUserMedia({ audio: true }, (stream) => {
        console.log('Setting up AudioContext ...');
        console.log(audioContext);
        console.log('Audio context sample rate = ' + audioContext.sampleRate);
        const mic = audioContext.createMediaStreamSource(stream);

        // We need the buffer size that is a power of two
        // and is longer than 1024 samples when resampled to 16000 Hz.
        // In most platforms where the sample rate is 44.1 kHz or 48 kHz,
        // this will be 4096, giving 10-12 updates/sec.
        const minBufferSize = audioContext.sampleRate / 16000 * 1024;
        for (var bufferSize = 4; bufferSize < minBufferSize; bufferSize *= 2);
        console.log('Buffer size = ' + bufferSize);
        const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
        //console.log(this);
        scriptNode.onaudioprocess = this.process_microphone_buffer.bind(this);
        // scriptNode.on('audioprocess', process_microphone_buffer);
        // It seems necessary to connect the stream to a sink
        // for the pipeline to work, contrary to documentataions.
        // As a workaround, here we create a gain node with zero gain,
        // and connect temp to the system audio output.
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, audioContext.currentTime);

        mic.connect(scriptNode);
        scriptNode.connect(gain);
        gain.connect(audioContext.destination);

        if (audioContext.state === 'running') {
          console.log('Running ...');
        } else {
          console.log('user gesture needed');
          // user gesture (like click) is required to start AudioContext, in some browser versions
          // status('<a href="javascript:crepe.resume();" style="color:red;">*
          // Click here to start the demo *</a>')
        }
      }, function(message) {
        console.log('Error: Could not access microphone - ' + message);
      });
    } else {
      console.log('could not access mic');
      // this.error('Could not access microphone - getUserMedia not available');
    }
  }

}

export default Crepe;

