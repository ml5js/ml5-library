/*
ImageNet Class
*/

import { ENV, Array3D } from 'deeplearn';
import { SqueezeNet } from 'deeplearn-squeezenet';
import { MobileNet } from './../utils/mobileNet';

class ImageNet {
  constructor(model) {
    this.model = model;
    this.readyPromise = null;
    this.math = ENV.math;
    if (this.model === 'SqueezeNet') {
      this.net = new SqueezeNet(this.math);
    } else if (this.model === 'MobileNet') {
      this.net = new MobileNet(this.math);
    } else {
      console.log(`${model} is not a valid model. Using MobileNet as default.`);
      this.net = new MobileNet(this.math);
    }
  }

  async predict(img, num, callback) {
    if (!this.readyPromise) {
      this.readyPromise = ImageNet.loadModel(this.net);
    }
    await this.readyPromise;
    return this.getClasses(img, num, callback);
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
    if (callback) {
      callback(results);
    }
    return results;
  }

  static async loadModel(model) {
    await model.load();
    return true;
  }
}

export default ImageNet;
