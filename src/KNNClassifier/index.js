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
  /**
   * Create a KNNClassifier instance.
   */
  constructor() {
    this.knnClassifier = knnClassifier.create();
    this.mapStringToIndex = [];
  }

  /**
   * Adding an example to a class.
   * @param {*} input - An example to add to the dataset, usually an activation from another model.
   * @param {number || String} classIndexOrLabel  The class index(number) or label(string) of the example.
   */
  addExample(input, classIndexOrLabel) {
    let classIndex;
    let example;

    if (typeof classIndexOrLabel === 'string') {
      if (!this.mapStringToIndex.includes(classIndexOrLabel)) {
        classIndex = this.mapStringToIndex.push(classIndexOrLabel) - 1;
      } else {
        classIndex = this.mapStringToIndex.indexOf(classIndexOrLabel);
      }
    } else if (typeof classIndexOrLabel === 'number') {
      classIndex = classIndexOrLabel;
    }

    if (Array.isArray(input)) {
      example = tf.tensor(input);
    } else {
      example = input;
    }
    this.knnClassifier.addExample(example, classIndex);
  }

  /**
   * Classify an new input. It returns an object with a top classIndex and label, confidences mapping all class indices to their confidence, and confidencesByLabel mapping all classes' confidence by label.
   * @param {*} input  - An example to make a prediction on, could be an activation from another model or an array of numbers.
   * @param {number} k  - Optional. The K value to use in K-nearest neighbors. The algorithm will first find the K nearest examples from those it was previously shown, and then choose the class that appears the most as the final prediction for the input example. Defaults to 3. If examples < k, k = examples.
   * @param {function} callback  - Optional. A function to be called once the input has been classified. If no callback is provided, it will return a promise that will be resolved once the model has classified the new input.
   */
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

  /**
   * Clear all examples in a label.
   * @param {number||number} labelIndex - The class index or label, a number or a string.
   */
  clearLabel(labelIndex) {
    let classIndex;
    if (typeof labelIndex === 'string') {
      if (this.mapStringToIndex.includes(labelIndex)) {
        classIndex = this.mapStringToIndex.indexOf(labelIndex);
      }
    } else if (typeof labelIndex === 'number') {
      classIndex = labelIndex;
    }
    this.knnClassifier.clearClass(classIndex);
  }

  clearAllLabels() {
    this.mapStringToIndex = [];
    this.knnClassifier.clearAllClasses();
  }

  /**
   * Get the example count for each label. It returns an object that maps class label to example count for each class.
   * @returns {Number}
   */
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

  /**
   * Get the example count for each class. It returns an object that maps class index to example count for each class.
   * @returns {Number}
   */
  getCount() {
    return this.knnClassifier.getClassExampleCount();
  }

  getClassifierDataset() {
    return this.knnClassifier.getClassifierDataset();
  }

  setClassifierDataset(dataset) {
    this.knnClassifier.setClassifierDataset(dataset);
  }

  /**
   * It returns the total number of labels.
   * @returns {String}
   */
  getNumLabels() {
    return this.knnClassifier.getNumClasses();
  }

  dispose() {
    this.knnClassifier.dispose();
  }

  /**
   * Download the whole dataset as a JSON file. It's useful for saving state.
   * @param {String} name - Optional. The name of the JSON file that will be downloaded. e.g. "myKNN" or "myKNN.json". If no fileName is provided, the default file name is "myKNN.json".
   */
  async save(name) {
    const dataset = this.knnClassifier.getClassifierDataset();
    if (this.mapStringToIndex.length > 0) {
      Object.keys(dataset).forEach((key) => {
        if (this.mapStringToIndex[key]) {
          dataset[key].label = this.mapStringToIndex[key];
        }
      });
    }
    const tensors = await Promise.all(Object.values(dataset).map(
      // TODO: is the null necessary? isn't there always a tensor? -Linda
      (tensor) => tensor ? tensor.data() : null
    ));
    await io.saveJSON({ dataset, tensors }, name || 'myKNN');
  }

  /**
   * Load a dataset from a JSON file. It's useful for restoring state.
   * @param {String} pathOrData - The path for a valid JSON file.
   * @param {function} callback - Optional. A function to run once the dataset has been loaded. If no callback is provided, it will return a promise that will be resolved once the dataset has loaded.
   */
  async load(pathOrData, callback) {
    let data;
    if (typeof pathOrData === 'object') {
      data = pathOrData;
    } else {
      data = await io.loadJSON(pathOrData);
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
