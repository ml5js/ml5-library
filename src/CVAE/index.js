// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
* CVAE: Run conditional auto-encoder for pro-trained model
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';

class Cvae {
  /**
   * Create a Conditional Variational Autoencoder (CVAE).
   * @param {String} modelPath - Required. The url path to your model.
   * @param {function} callback - Required. A function to run once the model has been loaded.
   */
  constructor(modelPath, callback) {
    /**
     * Boolean value that specifies if the model has loaded.
     * @type {boolean}
     * @public
     */
    this.ready = false;
    this.model = {};
    this.latentDim = tf.randomUniform([1, 16]);
    this.modelPath = modelPath;
    this.modelPathPrefix = '';

    this.jsonLoader().then(val => {
      this.modelPathPrefix = this.modelPath.split('manifest.json')[0]
      this.ready = callCallback(this.loadCVAEModel(this.modelPathPrefix+val.model), callback);
      this.labels = val.labels;
      // get an array full of zero with the length of labels [0, 0, 0 ...]
      this.labelVector = Array(this.labels.length+1).fill(0);
    });
  }
  
  // load tfjs model that is converted by tensorflowjs with graph and weights
  async loadCVAEModel(modelPath) {
    this.model = await tf.loadLayersModel(modelPath);
    return this;
  }

  /**
   * Generate a random result.
   * @param {String} label  - A label of the feature your want to generate
   * @param {function} callback  - A function to handle the results of ".generate()". Likely a function to do something with the generated image data.
   * @return {raw: ImageData, src: Blob, image: p5.Image}
   */
  async generate(label, callback) {
    return callCallback(this.generateInternal(label), callback);
  }

  loadAsync(url){
    return new Promise((resolve, reject) => {
        if(!this.ready) reject();
        loadImage(url, (img) => {
            resolve(img);
        });
    });
  };

  getBlob(inputCanvas) {
    return new Promise((resolve, reject) => {
      if (!this.ready) reject();

      inputCanvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  }

  checkP5() {
    if (typeof window !== 'undefined' && window.p5 && this
        && window.p5.Image && typeof window.p5.Image === 'function') return true;
    return false;
  }

  async generateInternal(label) {
    const res = tf.tidy(() => {
      this.latentDim = tf.randomUniform([1, 16]);
      const cursor = this.labels.indexOf(label);
      if (cursor < 0) {
        console.log('Wrong input of the label!');
        return [undefined, undefined]; // invalid input just return;
      }

      this.labelVector = this.labelVector.map(() => 0); // clear vector
      this.labelVector[cursor+1] = 1;

      const input = tf.tensor([this.labelVector]);

      const temp = this.model.predict([this.latentDim, input]);
      return temp.reshape([temp.shape[1], temp.shape[2], temp.shape[3]]);
    });
  

    const raws = await tf.browser.toPixels(res);
    res.dispose();

    const canvas = document.createElement('canvas'); // consider using offScreneCanvas
    const ctx = canvas.getContext('2d');
    const [x, y] = res.shape;
    canvas.width = x;
    canvas.height = y;
    const imgData = ctx.createImageData(x, y);
    const data = imgData.data;
    for (let i = 0; i < x * y * 4; i += 1) data[i] = raws[i];
    ctx.putImageData(imgData, 0, 0);

    const src = URL.createObjectURL(await this.getBlob(canvas));
    let image;
    /* global loadImage */
    if (this.checkP5()) image = await this.loadAsync(src); 
    return { src, raws, image };
  }

  async jsonLoader() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.modelPath);
      
      xhr.onload = () => {
        const json = JSON.parse(xhr.responseText);
        resolve(json);
      };
      xhr.onerror = (error) => {
        reject(error);
      };
      xhr.send();
    });
  }
}

const CVAE = (model, callback) => new Cvae(model, callback);


export default CVAE;
