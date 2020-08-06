// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint "no-param-reassign": [2, { "props": false }] */
/*
DBSCAN Algorithm (with Euclidian distance). Influenced By jDBSCAN
*/

import * as tf from "@tensorflow/tfjs-node";
import callCallback from '../utils/callcallback';

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
  if (typeof inputData === "string") {
    data = await readCsv(inputData);
  } else {
    data = inputData;
  }
  const dataFlat = data.map((d) => {
    return Object.values(d);
  });
  return dataFlat;
}

class DBSCAN {

  /**
   * Create a DBSCAN.
   * @param {String || array || object} dataset - The dataset to cluster. in x, y format => [{x:1,y:2}]
   * @param {options} options - An object describing a model's parameters:
   *    - eps: Minimum distance between neighbours
   *    - minPts: Minimum number of neighbours to count as a core point
   * @param {function} callback  - Optional. A callback to be called once 
   *    the model has loaded. If no callback is provided, it will return a 
   *    promise that will be resolved once the model has loaded.
   */

  constructor(dataset, options, callback) {
    this.config = {
      eps: options.eps || DEFAULTS.eps,
      minPts: options.minPts || DEFAULTS.minPts,
    };
    this.last_cluster_id = 0;
    this.status = [];
    this.load(dataset).then(callback);
    this.ready = callCallback(this.load(dataset), callback);
  }

  /**
   * Load dataset, and run model.
   * @param {string || array || object} dataset 
   */
  async load(dataset) {
    this.dataset = await loadDataset(dataset);
    tf.tidy(() => {
      this.dataTensor = tf.tensor2d(this.dataset);
      this.dataset.forEach((d) => {
        const tensors = tf.tensor1d(Object.values(d));
        d.tensor = tensors;
      });
      this.fit();
    });
    return this;
  }

   /**
   * Run DBSCAN algorithm.
   */
  fit() {
    this.dataset.forEach((d, idx) => {
      if (d.status === undefined) {
        d.status = 0; // initlize as a noise point
        let neighbours_indices = this.get_neighbours_indices(d);
        if (neighbours_indices.length < this.config.minPts) { // Border or noise 
          d.status = 0;
        } else {
          this.increment_cluster_id()
          this.extend(idx, neighbours_indices);
        }
      }
    });
  }
  
  /**
   * Extend cluster by running algorithm on neighbours and detect neighbours that are core points as well
   * @param {number} point_index 
   * @param {number[]} neighbours_indices
  */
  extend(t_point_idx, neighbours_indices) {
    this.dataset[t_point_idx].clusterid = this.get_cluster_id();
    this.dataset[t_point_idx].status = this.dataset[t_point_idx].clusterid;
    for (let i = 0; i < neighbours_indices.length; i++) {
      const curr_point_idx = neighbours_indices[i];

      if (this.dataset[curr_point_idx].status === undefined) {
        this.dataset[curr_point_idx].status = 0;
        let curr_neighbours = this.get_neighbours_indices(
          this.dataset[curr_point_idx]
        );
        let curr_num_neighbours = curr_neighbours.length;

        if (curr_num_neighbours >= this.config.minPts) {
          this.extend(curr_point_idx, curr_neighbours);
        }
      }

      if (this.dataset[curr_point_idx].status < 1) {
        this.dataset[curr_point_idx].status = this.dataset[
          t_point_idx
        ].clusterid;
        this.dataset[curr_point_idx].clusterid = this.dataset[
          t_point_idx
        ].clusterid;
      }
    }
  }

  /**
   * Return last generated cluster id
   */
  get_cluster_id() {
    return this.last_cluster_id;
  }
  /**
   * increment cluster id
   */
  increment_cluster_id() {
    this.last_cluster_id++
  }

  /**
   * Find closest neighbours to each observation.
   */
  get_neighbours_indices(t_point) {
    try {
      let neighbours = tf.tidy(() => {
        const { values, indices } = tf
          .squaredDifference(t_point.tensor, this.dataTensor)
          .sum(1)
          .sqrt()
          .topk(this.dataTensor.shape[0], true)
        return tf
          .stack([values.asType("float32"), indices.asType("float32")], 1)
          .arraySync()
          .filter((v, idx) => {
            return v[0] <= this.config.eps;
          })
          .reduce((prev, cur, idx, res) => {
            prev.push(cur[1]);
            return prev;
          }, []);
      });
      return neighbours;
    } catch (error) {
      console.log(`error ${error}`);
    }
  }
}

const dbscan = (dataset, options, callback) =>
  new DBSCAN(dataset, options, callback);

export default dbscan;
