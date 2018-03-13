import * as dl from 'deeplearn';
import ImageNet from './ImageNet/index';
import KNNImageClassifier from './KNNImage/index';
import LSTMGenerator from './LSTM/index';
import Word2Vec from './Word2vec/index';
import StyleTransfer from './StyleTransfer/index';
import * as imageUtils from './utils/imageUtilities';

module.exports = {
  ImageNet,
  KNNImageClassifier,
  LSTMGenerator,
  StyleTransfer,
  Word2Vec,
  ...imageUtils,
  dl,
};
