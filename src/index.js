// Copyright (c) 2018 ml5
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import * as dl from 'deeplearn';
import ImageClassifier from './ImageClassifier/index';
import KNNImageClassifier from './KNNImageClassifier/index';
import LSTMGenerator from './LSTM/index';
import Crepe from './Crepe/index';
import Word2Vec from './Word2vec/index';
import StyleTransfer from './StyleTransfer/index';
import * as imageUtils from './utils/imageUtilities';
module.exports = {
  ImageClassifier,
  KNNImageClassifier,
  LSTMGenerator,
  Crepe,
  StyleTransfer,
  Word2Vec,
  ...imageUtils,
  dl,
};
