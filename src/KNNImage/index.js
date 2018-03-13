/*
KNN Image Classifier model
*/

import { fromPixels } from 'deeplearn';
import { KNNImageClassifier as KNN } from 'deeplearn-knn-image-classifier';
import { processVideo } from '../utils/imageUtilities';

class KNNImageClassifier {
  constructor(numClasses, knnKValue, callback, video) {
    this.ready = false;
    this.hasAnyTrainedClass = false;
    this.knnKValue = 0 || knnKValue;
    this.numClasses = 15 || numClasses;
    this.knn = new KNN(this.numClasses, this.knnKValue);
    KNNImageClassifier.loadModel(this.knn).then(() => {
      this.ready = true;
      callback();
    });
    if (video instanceof HTMLVideoElement) {
      this.video = processVideo(video, '127');
    }
  }

  async addImage(input, index, callback) {
    if (this.ready) {
      const image = fromPixels(input);
      this.knn.addImage(image, index);
      this.hasAnyTrainedClass = true;
      if (callback) {
        callback();
      }
    }
  }

  async addImageFromVideo(index, callback) {
    if (this.ready && this.video) {
      const image = fromPixels(this.video);
      this.knn.addImage(image, index);
      this.hasAnyTrainedClass = true;
      if (callback) {
        callback();
      }
    }
  }

  async predictFromImage(input, callback) {
    if (this.ready && this.hasAnyTrainedClass) {
      const image = fromPixels(input);
      const results = await this.knn.predictClass(image);
      callback(results);
    }
  }

  async predictFromVideo(callback) {
    if (this.ready && this.hasAnyTrainedClass && this.video) {
      const image = fromPixels(this.video);
      const results = await this.knn.predictClass(image);
      callback(results);
    }
  }

  getClassExampleCount() {
    if (this.ready) {
      return this.knn.getClassExampleCount();
    }
    return null;
  }

  clearClass(classIndex, callback) {
    if (this.ready && this.hasAnyTrainedClass) {
      this.knn.clearClass(classIndex);
      if (callback) {
        callback();
      }
    }
  }

  static async loadModel(model) {
    await model.load();
  }
}

export default KNNImageClassifier;
