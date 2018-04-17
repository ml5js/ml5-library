/*
Kmeans
*/

import {
  sub,
  norm,
  randomUniform,
  tensor1d,
  stack,
} from 'deeplearn';

function pick(o, ...props) {
  return Object.assign({}, ...props.map(prop => ({ [prop]: o[prop] })));
}

function calcDistance(d1, d2) {
  // new vector generated subtracting the two vectors
  const differenceVector = sub(d1, d2);
  // calculate the norm of the vector, the absolute positive length
  const dist = norm(differenceVector);
  // get the calculated value in an async manner because javascript
  const distData = dist.dataSync();
  return distData[0];
}

class Kmeans {
  constructor(dataset, features = [], clusterCount = 8) {
    this.dataset = dataset;
    this.features = features;
    this.clusterCount = clusterCount;

    // build centroids
    this.centroids = Array.from({ length: clusterCount }, () => randomUniform([features.length]));

    // build tensors
    this.dataset.forEach((d) => {
      const subset = pick(d, ...this.features);
      const values = Object.values(subset);
      d.tensor = tensor1d(values);
    });

    this.findClosestCentroids();
  }

  findClosestCentroids() {
    // find closest initial tensor
    this.dataset.forEach((d) => {
      const distances = this.centroids.map(centroid => calcDistance(d.tensor, centroid));
      const centroidIndex = distances.indexOf(Math.min(...distances));
      d.centroid = centroidIndex;
    });
  }

  recenterCentroids() {
    // for range in count of centroids
    this.centroids = this.centroids.map((centroid, i) => {
      const matchingRecords = this.dataset.filter(d => d.centroid === i);
      const tensorArray = matchingRecords.map(record => record.tensor);
      if (tensorArray.length === 0) {
        return centroid;
      } else if (tensorArray.length === 1) {
        return tensorArray[0];
      }
      return stack(tensorArray).mean(0);
    });
  }

  step() {
    this.recenterCentroids();
    this.findClosestCentroids();
    return this.dataset.slice();
  }
}
export default Kmeans;
