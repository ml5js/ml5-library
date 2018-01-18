/*
p5ML
v.0.0.1
p5ML is a high level javascript library for machine learning.
Made @NYU ITP
*/

import * as dl from 'deeplearn';
import ImageNet from './ImageNet/index';
import KNNImageClassifier from './KNNImage/index';
import LSTMGenerator from './Lstm/index';
import NeuralNetwork from './NeuralNetwork/index';
import Word2Vec from './Word2vec/index';
import TransformNet from './TransformNet/index';

module.exports = {
  ImageNet,
  KNNImageClassifier,
  LSTMGenerator,
  NeuralNetwork,
  Word2Vec,
  dl,
  TransformNet,
};
