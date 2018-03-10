import * as dl from 'deeplearn';
import ImageNet from './ImageNet/index';
import KNNImageClassifier from './KNNImage/index';
import LSTMGenerator from './Lstm/index';
import Word2Vec from './Word2vec/index';
import FastStyle from './FastStyle/index';
import * as imageUtils from './utils/imageUtilities';

window.dl = dl;
module.exports = {
  ImageNet,
  KNNImageClassifier,
  LSTMGenerator,
  FastStyle,
  Word2Vec,
  ...imageUtils,
};
