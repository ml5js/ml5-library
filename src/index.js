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

module.exports = {
  imageClassifier,
  KNNClassifier,
  featureExtractor,
  pitchDetection,
  YOLO,
  word2vec,
  styleTransfer,
  poseNet,
  charRNN,
  pix2pix,
  SketchRNN,
  ...imageUtils,
  tf,
};
