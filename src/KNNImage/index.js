/*
KNN Image Classifier model

TODO: Resolve freeze on first train
*/

import { ENV, Array3D } from 'deeplearn';
import { KNNImageClassifier as KNN } from 'deeplearn-knn-image-classifier';

class KNNImageClassifier {
  constructor(callback, numClasses, knnKValue) {
    this.ready = false;
    this.hasAnyTrainedClass = false;
    this.predicting = false;
    this.knnKValue = 0 || knnKValue;
    this.numClasses = 15 || numClasses;
    this.math = ENV.math;
    this.classifier = new KNN(this.numClasses, this.knnKValue, this.math);
    KNNImageClassifier.loadModel(this.classifier).then(() => {
      this.ready = true;
      callback();
    });
  }

  async addImage(input, index) {
    if (this.ready) {
      this.predicting = false;
      await this.math.scope(async () => {
        const image = Array3D.fromPixels(input);
        this.classifier.addImage(image, index);
        this.hasAnyTrainedClass = true;
      });
    }
  }

  async predict(input, callback) {
    if (this.ready && this.hasAnyTrainedClass) {
      await this.math.scope(async () => {
        this.predicting = true;
        const image = Array3D.fromPixels(input);
        const results = await this.classifier.predictClass(image);
        callback(results);
      });
    }
  }

  getClassExampleCount() {
    if (this.ready) {
      return this.classifier.getClassExampleCount();
    }
    return null;
  }

  clearClass(classIndex) {
    if (this.ready && this.hasAnyTrainedClass) {
      this.classifier.clearClass(classIndex);
    }
  }

  static async loadModel(model) {
    await model.load();
  }
}

export default KNNImageClassifier;
