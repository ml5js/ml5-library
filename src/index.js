// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import pitchDetection from './PitchDetection/';
import imageClassifier from './ImageClassifier/';
import KNNClassifier from './KNNClassifier/';
import featureExtractor from './FeatureExtractor/';
import word2vec from './Word2vec/';
import YOLO from './YOLO';
import poseNet from './PoseNet';
import * as imageUtils from './utils/imageUtilities';
import styleTransfer from './StyleTransfer/';
import charRNN from './CharRNN/';
import pix2pix from './Pix2pix/';
import SketchRNN from './SketchRNN';
import preloadRegister from './utils/p5PreloadHelper';
import { version } from '../package.json';

const withPreload = {
  charRNN,
  featureExtractor,
  imageClassifier,
  pitchDetection,
  pix2pix,
  poseNet,
  SketchRNN,
  styleTransfer,
  word2vec,
  YOLO,
};

module.exports = Object.assign({}, preloadRegister(withPreload), {
  KNNClassifier,
  ...imageUtils,
  tf,
  version,
});
