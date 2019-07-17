// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
 * A K-nearest neighbors (KNN) classifier that allows fast
 * custom model training on top of any tensor input. Useful for transfer
 * learning with an embedding from another pretrained model.
*/

import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as io from '../utils/io';
import callCallback from '../utils/callcallback';

class KNN {
  constructor() {
    this.knnClassifier = knnClassifier.create();
    this.mapStringToIndex = [];
  }

  addExample(input, classIndexOrLabel) {
    let classIndex;
    let example;

    if (typeof classIndexOrLabel === 'string') {
      if (!this.mapStringToIndex.includes(classIndexOrLabel)) {
        classIndex = this.mapStringToIndex.push(classIndexOrLabel) - 1;
      } else {
        classIndex = this.mapStringToIndex.indexOf(classIndexOrLabel);
      }
    } else if (classIndexOrLabel === 'number') {
      classIndex = classIndexOrLabel;
    }

    if (Array.isArray(input)) {
      example = tf.tensor(input);
    } else {
      example = input;
    }
    this.knnClassifier.addExample(example, classIndex);
  }

  async classify(input, kOrCallback, cb) {
    let k = 3;
    let callback = cb;
    let example;

    if (typeof kOrCallback === 'number') {
      k = kOrCallback;
    } else if (typeof kOrCallback === 'function') {
      callback = kOrCallback;
    }

    if (Array.isArray(input)) {
      example = tf.tensor(input);
    } else {
      example = input;
    }

    return callCallback(this.classifyInternal(example, k), callback);
  }

  async classifyInternal(input, k) {
    const numClass = this.knnClassifier.getNumClasses();
    if (numClass <= 0) {
      throw new Error('There is no example in any class');
    } else {
      const res = await this.knnClassifier.predictClass(input, k);
      if (this.mapStringToIndex.length > 0) {
        if (res.classIndex || res.classIndex === 0) {
          const label = this.mapStringToIndex[res.classIndex];
          if (label) res.label = label;
        }
        if (res.confidences) {
          res.confidencesByLabel = {};
          const { confidences } = res;
          const indexes = Object.keys(confidences);
          indexes.forEach((index) => {
            const label = this.mapStringToIndex[index];
            res.confidencesByLabel[label] = confidences[index];
          });
        }
      }
      return res;
    }
  }

  clearLabel(labelIndex) {
    let classIndex;
    if (typeof labelIndex === 'string') {
      if (this.mapStringToIndex.includes(labelIndex)) {
        classIndex = this.mapStringToIndex.indexOf(labelIndex);
      }
    } else {
      classIndex = labelIndex;
    }
    this.knnClassifier.clearClass(classIndex);
  }

  clearAllLabels() {
    this.mapStringToIndex = [];
    this.knnClassifier.clearAllClasses();
  }

  getCountByLabel() {
    const countByIndex = this.knnClassifier.getClassExampleCount();
    if (this.mapStringToIndex.length > 0) {
      const countByLabel = {};
      Object.keys(countByIndex).forEach((key) => {
        if (this.mapStringToIndex[key]) {
          const label = this.mapStringToIndex[key];
          countByLabel[label] = countByIndex[key];
        }
      });
      return countByLabel;
    }
    return countByIndex;
  }

  getCount() {
    return this.knnClassifier.getClassExampleCount();
  }

  getClassifierDataset() {
    return this.knnClassifier.getClassifierDataset();
  }

  setClassifierDataset(dataset) {
    this.knnClassifier.setClassifierDataset(dataset);
  }

  getNumLabels() {
    return this.knnClassifier.getNumClasses();
  }

  dispose() {
    this.knnClassifier.dispose();
  }

  async save(name) {
    const dataset = this.knnClassifier.getClassifierDataset();
    if (this.mapStringToIndex.length > 0) {
      Object.keys(dataset).forEach((key) => {
        if (this.mapStringToIndex[key]) {
          dataset[key].label = this.mapStringToIndex[key];
        }
      });
    }
    const tensors = Object.keys(dataset).map((key) => {
      const t = dataset[key];
      if (t) {
        return t.dataSync();
      }
      return null;
    });
    let fileName = 'myKNN.json';
    if (name) {
      fileName = name.endsWith('.json') ? name : `${name}.json`;
    }
    await io.saveBlob(JSON.stringify({ dataset, tensors }), fileName, 'application/octet-stream');
  }

  async load(pathOrData, callback) {
    let data;
    if (typeof pathOrData === 'object') {
      data = pathOrData;
    } else {
      data = await io.loadFile(pathOrData);
    }
    if (data) {
      const { dataset, tensors } = data;
      this.mapStringToIndex = Object.keys(dataset).map(key => dataset[key].label);
      const tensorsData = tensors
        .map((tensor, i) => {
          if (tensor) {
            const values = Object.keys(tensor).map(v => tensor[v]);
            return tf.tensor(values, dataset[i].shape, dataset[i].dtype);
          }
          return null;
        })
        .reduce((acc, cur, j) => {
          acc[j] = cur;
          return acc;
        }, {});
      this.knnClassifier.setClassifierDataset(tensorsData);
      if (callback) {
        callback();
      }
    }
  }
}

const KNNClassifier = () => new KNN();

export default KNNClassifier;
