/*
Image classifier class based on ImageNet trained models.
SqueezeNet and MobileNet supported.
*/

import { fromPixels, image } from 'deeplearn';
import { SqueezeNet } from 'deeplearn-squeezenet';
import { MobileNet } from './MobileNet';
import { processVideo } from '../utils/imageUtilities';

class ImageClassifier {
  constructor(model) {
    this.model = model;
    this.readyPromise = null;
    if (this.model === 'SqueezeNet') {
      this.net = new SqueezeNet();
    } else if (this.model === 'MobileNet') {
      this.net = new MobileNet();
    } else {
      console.warn(`${model} is not a valid model. Using MobileNet as default.`);
      this.net = new MobileNet();
    }
    this.video = null;
  }

  async predict(input, num, callback) {
    if (input instanceof HTMLVideoElement && !this.video) {
      this.video = processVideo(input, '127');
    }

    if (!this.readyPromise) {
      this.readyPromise = ImageClassifier.loadModel(this.net);
    }

    await this.readyPromise;
    if (this.video) {
      if (this.video.src) {
        return this.getClasses(this.video, num, callback);
      }
    }
    return this.getClasses(input, num, callback);
  }

  // Private Method
  async getClasses(img, num, callback) {
    const pixels = fromPixels(img);
    const resized = image.resizeBilinear(pixels, [227, 227]);
    const results = [];
    const result = this.net.predict(resized);
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

export default ImageClassifier;
