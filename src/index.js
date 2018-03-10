import * as dl from 'deeplearn';
import ImageNet from './ImageNet/index';
import KNNImageClassifier from './KNNImage/index';
import LSTMGenerator from './Lstm/index';
import NeuralNetwork from './NeuralNetwork/index';
import Word2Vec from './Word2vec/index';
import FastStyle from './FastStyle/index';
import Yolo from './Yolo/index';
import * as imageUtils from './utils/imageUtilities';

window.dl = dl;
module.exports = {
  ImageNet,
  KNNImageClassifier,
  LSTMGenerator,
  NeuralNetwork,
  FastStyle,
  Yolo,
  Word2Vec,
  ...imageUtils,
};
