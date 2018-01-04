/*
p5ML v.0.0.1

p5ML is a high level javascript library for machine learning.
Made @NYU ITP
*/


import * as dl from 'deeplearn';

import ImageNet from './ImageNet/index';
import KNNImageClassifier from './KNNImage/index';
import LSTMGenerator from './Lstm/index';
// import NeuralNetwork from './NeuralNetwork/index';

// console.log('p5ML loaded');

module.exports = {
  ImageNet,
  KNNImageClassifier,
  LSTMGenerator,
  dl,
};
