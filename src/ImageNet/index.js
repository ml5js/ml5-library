/* eslint-env browser */
/*
ImageNet Class
*/

import { ENV, Array3D } from 'deeplearn';
import { SqueezeNet } from 'deeplearn-squeezenet';
import { MobileNet } from './../utils/mobileNet';
import { processImage, processVideo } from '../utils/imageUtilities';

class ImageNet {
  constructor(model) {
    this.model = model;
    this.ready = false;
    this.math = ENV.math;
    if (this.model === 'SqueezeNet') {
      this.net = new SqueezeNet(this.math);
    } else if (this.model === 'MobileNet') {
      this.net = new MobileNet(this.math);
    } else {
      console.warn(`${model} is not a valid model. Using MobileNet as default.`);
      this.net = new MobileNet(this.math);
    }
    this.videoElt = null;
  }

  async predict(input, num, callback) {
    let img;

    if (input instanceof HTMLImageElement) {
      img = processImage(input, '227');
    } else if (input instanceof HTMLVideoElement && !this.videoElt) {
      this.videoElt = processVideo(input, '127');
    }

    if (this.ready) {
      if (this.videoElt) {
        this.getClasses(this.videoElt, num, callback);
      } else {
        this.getClasses(img, num, callback);
        img = null;
      }
    } else if (this.videoElt) {
      ImageNet.loadModel(this.net).then(() => {
        this.ready = true;
        this.getClasses(this.videoElt, num, callback);
      });
    } else {
      ImageNet.loadModel(this.net).then(() => {
        this.ready = true;
        this.getClasses(img, num, callback);
        img = null;
      });
    }
  }

  // Private Method
  async getClasses(img, num, callback) {
    const image = Array3D.fromPixels(img);
    const results = [];
    const result = this.net.predict(image);
    const topKClasses = await this.net.getTopKClasses(result, num || 10);
    Object.keys(topKClasses).forEach((value) => {
      results.push({
        label: value,
        probability: topKClasses[value],
      });
    });
    results.sort((a, b) => b.probability - a.probability);
    callback(results);
  }

  static async loadModel(model) {
    await model.load();
    return true;
  }
}

export default ImageNet;
