// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Word2Vec
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';

class Word2Vec {
  constructor(model, callback) {
    this.model = {};
    this.modelSize = 0;

    const loadModel = async (file) => {
      const json = await fetch(file)
        .then(response => response.json());
      Object.keys(json.vectors).forEach((word) => {
        this.model[word] = tf.tensor1d(json.vectors[word]);
      });
      this.modelSize = Object.keys(json).length;
      return this;
    };

    this.ready = callCallback(loadModel(model), callback);
  }

  add(inputs, max = 1) {
    const sum = Word2Vec.addOrSubtract(this.model, inputs, 'ADD');
    return Word2Vec.nearest(this.model, sum, inputs.length, inputs.length + max);
  }

  subtract(inputs, max = 1) {
    const subtraction = Word2Vec.addOrSubtract(this.model, inputs, 'SUBTRACT');
    return Word2Vec.nearest(this.model, subtraction, inputs.length, inputs.length + max);
  }

  average(inputs, max = 1) {
    const sum = Word2Vec.addOrSubtract(this.model, inputs, 'ADD');
    const avg = tf.div(sum, tf.tensor(inputs.length));
    return Word2Vec.nearest(this.model, avg, inputs.length, inputs.length + max);
  }

  nearest(input, max = 10) {
    const vector = this.model[input];
    if (!vector) {
      return null;
    }
    return Word2Vec.nearest(this.model, vector, 1, max + 1);
  }

  getRandomWord() {
    const words = Object.keys(this.model);
    return words[Math.floor(Math.random() * words.length)];
  }

  static addOrSubtract(model, values, operation) {
    const vectors = [];
    const notFound = [];
    if (values.length < 2) {
      throw new Error('Invalid input, must be passed more than 1 value');
    }
    values.forEach((value) => {
      const vector = model[value];
      if (!vector) {
        notFound.push(value);
      } else {
        vectors.push(vector);
      }
    });

    if (notFound.length > 0) {
      throw new Error(`Invalid input, vector not found for: ${notFound.toString()}`);
    }
    let result = vectors[0];
    if (operation === 'ADD') {
      for (let i = 1; i < vectors.length; i += 1) {
        result = tf.add(result, vectors[i]);
      }
    } else {
      for (let i = 1; i < vectors.length; i += 1) {
        result = tf.sub(result, vectors[i]);
      }
    }
    return result;
  }

  static nearest(model, input, start, max) {
    const nearestVectors = [];
    Object.keys(model).forEach((word) => {
      const distance = tf.util.distSquared(input.dataSync(), model[word].dataSync());
      nearestVectors.push({ word, distance });
    });
    nearestVectors.sort((a, b) => a.distance - b.distance);
    return nearestVectors.slice(start, max);
  }
}

const word2vec = (model, cb) => {
  const instance = new Word2Vec(model, cb);
  return cb ? instance : instance.ready;
};

export default word2vec;
