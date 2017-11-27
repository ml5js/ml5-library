/*
KNN Image Classifier model
*/

import { KNNImageClassifier as KNN } from 'deeplearn-knn-image-classifier';
import { Array3D } from 'deeplearn';
import { math } from './../utils';

class KNNImageClassifier {
  constructor(callback) {
    this.knnKValue = 5;
    this.maxControls = 15;
    this.modelLoaded = false;
    this.classifier = new KNN(this.maxControls, this.knnKValue, math);
    let loadModel = this.classifier.load();
    loadModel.then(() => {
      this.modelLoaded = true;
      callback();
    });
  }

  addImage(input, index) {
    if (this.modelLoaded) {
      math.scope(async(keep, track) => {
        const image = track(Array3D.fromPixels(input));
        await this.classifier.addImage(image, index);
      });
    } else {
      console.log(`The Model has not finished loading. Wait until it loads and try again`)
    }
  }

  predict(input, callback) {
    if (this.modelLoaded) {
      math.scope(async(keep, track) => {
        const image = Array3D.fromPixels(input);
        const results = await this.classifier.predict(image);
        callback(results);
      });
    } else {
      console.log(`The Model has not finished loading. Wait until it loads and try again`)
    }
  }

  getClassExampleCount() {
    if (this.modelLoaded) {
      return this.classifier.getClassExampleCount();
    } else {
      console.log(`The Model has not finished loading. Wait until it loads and try again`)
    }
  }

  clearClass(classIndex) {
    if (this.modelLoaded) {
      this.classifier.clearClass(classIndex);
    } else {
      console.log(`The Model has not finished loading. Wait until it loads and try again`)
    }
  }
}

export { KNNImageClassifier }