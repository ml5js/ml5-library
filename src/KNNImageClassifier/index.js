// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
KNN Image Classifier model
*/

import * as dl from 'deeplearn';
import { KNNImageClassifier as KNN } from 'deeplearn-knn-image-classifier';
import { processVideo } from '../utils/imageUtilities';
import * as io from '../utils/io';

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
      const image = dl.fromPixels(input);
      this.knn.addImage(image, index);
      this.hasAnyTrainedClass = true;
      if (callback) {
        callback();
      }
    }
  }

  async addImageFromVideo(index, callback) {
    if (this.ready && this.video) {
      const image = dl.fromPixels(this.video);
      this.knn.addImage(image, index);
      this.hasAnyTrainedClass = true;
      if (callback) {
        callback();
      }
    }
  }

  async predictFromImage(input, callback) {
    if (this.ready && this.hasAnyTrainedClass) {
      const image = dl.fromPixels(input);
      const results = await this.knn.predictClass(image);
      callback(results);
    }
  }

  async predictFromVideo(callback) {
    if (this.ready && this.hasAnyTrainedClass && this.video) {
      const image = dl.fromPixels(this.video);
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

  save(name) {
    const logits = this.knn.classLogitsMatrices;
    const tensors = logits.map((t) => {
      if (t) {
        return t.dataSync();
      }
      return null;
    });
    const fileName = name || Date.now();
    io.saveFile(`${fileName}.json`, JSON.stringify({ logits, tensors }));
  }

  load(path, callback) {
    io.loadFile(path, (data) => {
      const tensors = data.tensors.map((tensor, i) => {
        if (tensor) {
          const values = Object.keys(tensor).map(v => tensor[v]);
          return dl.tensor(values, data.logits[i].shape, data.logits[i].dtype);
        }
        return null;
      });
      this.hasAnyTrainedClass = true;
      this.knn.setClassLogitsMatrices(tensors);
      if (callback) {
        callback();
      }
    });
  }

  static async loadModel(model) {
    await model.load();
  }
}

export default KNNImageClassifier;
