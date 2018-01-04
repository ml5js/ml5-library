/*
ImageNet Class

TODO: model name in constructor is just a placeholder value.
*/

import { ENV, Array3D } from 'deeplearn';
import { SqueezeNet } from 'deeplearn-squeezenet';

class ImageNet {
  constructor(model) {
    this.model = model;
    this.ready = false;
    this.math = ENV.math;
    this.squeezeNet = new SqueezeNet(this.math);
  }

  async predict(img, num, callback) {
    if (this.ready) {
      this.getClasses(img, num, callback);
    } else {
      ImageNet.loadModel(this.squeezeNet).then(() => {
        this.ready = true;
        this.getClasses(img, num, callback);
      });
    }
  }

  // Private Method
  async getClasses(img, num, callback) {
    const image = Array3D.fromPixels(img);
    const results = [];
    const result = this.squeezeNet.predict(image);
    const topKClasses = await this.squeezeNet.getTopKClasses(result, num || 10);
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
