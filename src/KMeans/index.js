// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getInitialCentroids"] }] */
/* eslint "no-param-reassign": [2, { "props": false }] */
/*
KMeans
This class provides the following unsupervised clustering methods:
- K-Means
More will be added.
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import { randomSample } from '../utils/random';

const DEFAULTS = {
	'maxIter': 5,
	'threshold': 0.5,
};

async function readCsv(url) {
	const myCsv = tf.data.csv(url);
	const loadedData = await myCsv.toArray();
	return loadedData;
}

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

	constructor(dataset, options, callback) {
	    this.k = options.k;
	    this.maxIter = options.maxIter || DEFAULTS.maxIter;
	    this.threshold = options.threshold || DEFAULTS.threshold;
			this.ready = callCallback(this.load(dataset), callback);
  }

  async load(dataset) {
		this.dataset = await loadDataset(dataset);
	  this.dataTensor = tf.tensor2d(this.dataset);
	  this.dataset.forEach(d => {
	  	const tensors = tf.tensor1d(Object.values(d));
	  	d.tensor = tensors;
	  });
	  this.centroids = tf.tensor2d(randomSample(this.dataset, this.k, false));
	  this.fit();
	  console.log('final centroids:')
	  this.centroids.print()
	  return this;
  }

  fit() {
    this.getClosestCentroids()
    this.recenterCentroids();
    let centroidDistance = KMeans.getEuclidianDistance(this.centroids, this.centroidsOld);
    console.log(centroidDistance);
    let iteration = 0;
    while(centroidDistance > this.threshold &&  iteration < this.maxIter) {
      this.getClosestCentroids();
      this.recenterCentroids();
      centroidDistance = KMeans.getEuclidianDistance(this.centroids, this.centroidsOld);
      iteration += 1;
      console.log('iteration: ', iteration)
      console.log('centroidDistance: ', centroidDistance)
    }
  }

  getClosestCentroids() {
    // find closest initial tensor
    this.dataset.forEach(d => {
      const minCentroid = this.closestCentroid(d.tensor);
      d.centroid = minCentroid;
    })
  }

  closestCentroid(dataTensor) {
  	const dist = this.centroids.squaredDifference(dataTensor).sum(1).sqrt();
    const minCentroid = dist.argMin().arraySync();
    return minCentroid;
  }

  classify(value) {
  	// input must be array or object
  	const valueTensor = tf.tensor1d(Object.values(value));
    const minCentroid = this.closestCentroid(valueTensor);
    return minCentroid;
  }

  recenterCentroids() {
    // store previous run's centroids for convergence
    this.centroidsOld = this.centroids;
    // recenter each centroid
    this.centroids = tf.stack(this.centroids.unstack().map((centroid, k) => {
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
  }

  static getEuclidianDistance(arr1, arr2) {
    // calculate euclidian distance between two arrays
    const distTensor = tf.tidy(() => {
      const distance = tf.squaredDifference(arr1, arr2).sum().sqrt();
      return distance.dataSync()
    })
    return distTensor[0];
  }

}

const kmeans = (dataset, options, callback) => new KMeans(dataset, options, callback);

export default kmeans;