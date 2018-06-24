// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
 * A K-nearest neighbors (KNN) classifier that allows fast
 * custom model training on top of any tensor input. Useful for transfer
 * learning with an embedding from another pretrained model.
*/

import * as knnClassifier from '@tensorflow-models/knn-classifier';

class KNN {
  constructor() {
    this.knnClassifier = knnClassifier.create();
  }

  addExample(example, classIndex) {
    this.knnClassifier.addExample(example, classIndex);
  }

  async predictClass(input, k = 3) {
    const res = await this.knnClassifier.predictClass(input, k);
    return res;
  }

  clearClass(classIndex) {
    this.knnClassifier.clearClass(classIndex);
  }

  clearAllClasses(classIndex) {
    this.knnClassifier.clearAllClasses(classIndex);
  }

  getClassExampleCount() {
    return this.knnClassifier.getClassExampleCount();
  }

  getClassifierDataset() {
    return this.knnClassifier.getClassifierDataset();
  }

  setClassifierDataset(dataset) {
    this.knnClassifier.setClassifierDataset(dataset);
  }

  getNumClasses() {
    return this.knnClassifier.getNumClasses();
  }

  dispose() {
    this.knnClassifier.dispose();
  }
}

const KNNClassifier = () => new KNN();

export default KNNClassifier;
