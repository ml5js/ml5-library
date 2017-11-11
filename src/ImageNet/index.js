/*
Image net Class
*/

import { math } from './../utils/index';
import { Array3D } from 'deeplearn';
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

  predict(img, callback, num) {
    if (!this.squeezeNet) {
      setTimeout(() => {
        this.predict(img, callback)
      }, 400)
    } else {
      const image = Array3D.fromPixels(img);
      let _squeezeNet = this.squeezeNet;
      async function predictImage() {
        const inferenceResult = await _squeezeNet.predict(image);
        return await _squeezeNet.getTopKClasses(inferenceResult.logits, num || 10);
      }
      predictImage().then(data => {

        let results = [];
        for (let value in data){
          let result = {
            label: value,
            probability: data[value]
          }
          results.push(result);
        }
        results.sort((a,b) => b.probability - a.probability);
        callback(results);
      });
    }
  }

}

export { ImageNet };
