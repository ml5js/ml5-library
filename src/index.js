/*
p5ML v.0.0.1

p5ML is a high level javascript library for machine learning.
Made @ NYU ITP
*/

'use strict';
console.log('p5ML loaded');

import { NeuralNetwork } from './NeuralNetwork/index';
import { LSTMGenerator } from './Lstm/index';
import { ImageNet } from './ImageNet/index';
import { KNNImageClassifier } from './KNNImage/index';

import * as deeplearn from 'deeplearn';
import { math } from './utils/math';
 
window.deeplearn = deeplearn;

module.exports = {
  NeuralNetwork,
  LSTMGenerator,
  ImageNet,
  KNNImageClassifier,
  math
};