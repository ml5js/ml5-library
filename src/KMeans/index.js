// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint "no-param-reassign": [2, { "props": false }] */
/*
K-Means Algorithm (with Euclidian distance).
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import {
  randomSample
} from '../utils/random';

const DEFAULTS = {
  'k': 3,
  'maxIter': 5,
  'threshold': 0.5,
};

/**
 * Read in a csv file from a path to its location.
 * @param {string} path 
 */
async function readCsv(path) {
  const myCsv = tf.data.csv(path);
  const loadedData = await myCsv.toArray();
  return loadedData;
}

/**
 * Load and flatten an array of arrays, an array of objects, or a string
 *   path to a csv.
 * @param {string || array || object} inputData 
 */
async function loadDataset(inputData) {
  let data;
  if (typeof inputData === 'string') {
    data = await readCsv(inputData);
  } else {
    data = inputData;
  }
  const dataFlat = data.map((d) => {
    return Object.values(d)
  });
  return dataFlat;
}


class KMeans {
  /**
   * Create a K-Means.
   * @param {String || array || object} dataset - The dataset to cluster.
   * @param {options} options - An object describing a model's parameters:
   *    - k: number of clusters
   *    - maxIter: Max number of iterations to try before forcing convergence.
   *    - threshold: Threshold for updated centriod distance before declaring convergence.
   * @param {function} callback  - Optional. A callback to be called once 
   *    the model has loaded. If no callback is provided, it will return a 
   *    promise that will be resolved once the model has loaded.
   */
  constructor(dataset, options, callback) {
    this.config = {
      k: options.k || DEFAULTS.k,
      maxIter: options.maxIter || DEFAULTS.maxIter,
      threshold: options.threshold || DEFAULTS.threshold
    };
    this.ready = callCallback(this.load(dataset), callback);
  }

  /**
   * Load dataset, find initial centroids, and run model.
   * @param {string || array || object} dataset 
   */
  async load(dataset) {
    
    this.dataset = await loadDataset(dataset);
    tf.tidy( () => {
      this.dataTensor = tf.tensor2d(this.dataset);
      this.dataset.forEach(d => {
        const tensors = tf.tensor1d(Object.values(d));
        d.tensor = tensors;
      });
      this.centroids = tf.tensor2d(randomSample(this.dataset, this.config.k, false));
      this.fit();
    })
  
    return this;
  }

  /**
   * Run K-Means algorithm.
   */
  fit() {
    this.getClosestCentroids()
    this.recenterCentroids();
    let centroidDistance = KMeans.getEuclidianDistance(this.centroids, this.centroidsOld);
    let iteration = 0;
    while (centroidDistance > this.config.threshold && iteration < this.config.maxIter) {
      this.getClosestCentroids();
      this.recenterCentroids();
      centroidDistance = KMeans.getEuclidianDistance(this.centroids, this.centroidsOld);
      iteration += 1;
    }
  }

  /**
   * Find closest centroids to each observation and store as attribute.
   */
  getClosestCentroids() {
    // find closest initial tensor
    this.dataset.forEach(d => {
      const minCentroid = this.closestCentroid(d.tensor);
      d.centroid = minCentroid;
    })
  }

  /**
   * Load and flatten an array of arrays, an array of objects, or a string
   *   path to a csv.
   * @param {string || array || object} inputData 
   */
  closestCentroid(dataTensor) {
    return tf.tidy(() => {
      const dist = this.centroids.squaredDifference(dataTensor).sum(1).sqrt();
      const minCentroid = dist.argMin().arraySync();
      return minCentroid;
    });
  }

  /**
   * Assing `value` to a cluster.
   * @param {array || object} value 
   */
  classify(value) {
    return tf.tidy(() => {
      // input must be array or object
      const valueTensor = tf.tensor1d(Object.values(value));
      const minCentroid = this.closestCentroid(valueTensor);
      return minCentroid;
    })
  }

  /**
   * Recenter each centroid.
   */
  recenterCentroids() {
    // store previous run's centroids for convergence
    // recenter each centroid
    const result = tf.tidy( () => {
      this.centroidsOld = this.centroids;
      return tf.stack(this.centroids.unstack().map((centroid, k) => {
        // subset centroid to its cluster
        const centroidK = this.dataset.filter(d => d.centroid === k);
        // conver to tensor
        const centroidKTensor = centroidK.map(d => d.tensor);
        if (centroidKTensor.length === 0) {
          return centroid;
        } else if (centroidKTensor.length === 1) {
          return centroidKTensor[0];
        }
        // grab mean for for cluster
        const newCentroids = tf.tidy(() => tf.stack(centroidKTensor).mean(0));
        return newCentroids
      }))
    })
    this.centroids = result;
  }

  /**
   * Calculate the Euclidian distance between two tensors.
   * @param {tf.tensor} tensor1 
   * @param {tf.tensor} tensor2
   */
  static getEuclidianDistance(tensor1, tensor2) {
    // calculate euclidian distance between two arrays
    const distTensor = tf.tidy(() => {
      const distance = tf.squaredDifference(tensor1, tensor2).sum().sqrt();
      return distance.dataSync()
    })
    return distTensor[0];
  }
}

const kmeans = (dataset, options, callback) => new KMeans(dataset, options, callback);

export default kmeans;