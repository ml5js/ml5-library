/*
Kmeans
*/

import { div, tensor, add, sub, util } from 'deeplearn';

class Kmeans {

  constructor(dataset, features=[], clusterCount = 8) {
    this.dataset = dataset;
    this.features = features;
    this.clusterCount = clusterCount;
	this.extents = [];

    // build extents
    this.features.forEach(feature => {
      let extent = d3.extent(this.dataset, d => d[feature])
      this.extents[feature] = extent;
    })

    // build centroids
    this.centroids = Array.from(
      {length: clusterCount}, () => dl.randomUniform([features.length])
    );

    // build tensors
    this.dataset.forEach(d => {
      let subset =  this.pick(d, ...this.features);
      let values = Object.values(subset);
      d.tensor = dl.tensor1d(values)
    })

    this.findClosestCentroids();
  }

  pick(o, ...props) {
    return Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})));
  }

  calcDistance(d1, d2) {
    // new vector generated subtracting the two vectors
    let differenceVector = dl.sub(d1,d2)
    // calculate the norm of the vector, the absolute positive length
    let dist = dl.norm(differenceVector)
    // get the calculated value in an async manner because javascript
    let distData = dist.dataSync();
    return distData[0];
  }

  findClosestCentroids() {
    // find closest initial tensor
    this.dataset.forEach(d => {
      let distances = this.centroids.map(centroid => this.calcDistance(d.tensor, centroid));
      let centroidIndex = distances.indexOf( Math.min(...distances) );
      d.centroid = centroidIndex;
    })
  }

  recenterCentroids() {
    let rangeArray = [...Array(this.clusterCount).keys()];
    // for range in count of centroids
    this.centroids = this.centroids.map( (centroid, i) => {
      let matchingRecords = this.dataset.filter(d => d.centroid == i);
      let tensorArray = matchingRecords.map(record => record.tensor);
      if (tensorArray.length == 0) {
        return centroid;
      } else if (tensorArray.length == 1) {
        return tensorArray[0];
      } else {
        return dl.stack(tensorArray).mean(0);
      }
    })
  }

  step() {
    this.recenterCentroids();
    this.findClosestCentroids();
    return this.dataset.slice();
  }
}
export default Kmeans;
