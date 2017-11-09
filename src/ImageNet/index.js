/*
Image net Class
*/

import { math } from './../utils/index';
import { Array3D, softmax } from 'deeplearn';
import { SqueezeNet } from './squeezenet';

class ImageNet {
  constructor(model) {
    this.model = model;
    async function loadSqueezNet() {
      let squeezeNet = await new SqueezeNet(math);
      await squeezeNet.load();
      return squeezeNet
    }
    loadSqueezNet().then(sn => this.squeezeNet = sn);
  }

  predict(img, callback) {
    if (!this.squeezeNet) {
      setTimeout(() => {
        this.predict(img, callback)
      }, 400)
    } else {
      const image = Array3D.fromPixels(img);
      let _squeezeNet = this.squeezeNet;
      async function predictImage() {
        const inferenceResult = await _squeezeNet.predict(image);
        return await _squeezeNet.getTopKClasses(inferenceResult.logits, 10);
      }
      predictImage().then(data => callback(data));
    }
  }

}

export { ImageNet };