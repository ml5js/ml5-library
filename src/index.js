// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import pitchDetection from './PitchDetection/index';
import imageClassifier from './ImageClassifier/index';
import soundClassifier from './SoundClassifier/index';
import KNNClassifier from './KNNClassifier/index';
import featureExtractor from './FeatureExtractor/index';
import word2vec from './Word2vec/index';
import YOLO from './ObjectDetector/YOLO/index';
import objectDetector from './ObjectDetector/index';
import poseNet from './PoseNet/index';
import * as imageUtils from './utils/imageUtilities';
import styleTransfer from './StyleTransfer/index';
import charRNN from './CharRNN/index';
import pix2pix from './Pix2pix/index';
import sketchRNN from './SketchRNN/index';
import uNet from './UNET/index';
import CVAE from './CVAE/index';
import DCGAN from './DCGAN/index';
import preloadRegister from './utils/p5PreloadHelper';
import { version } from '../package.json';
import sentiment from './Sentiment/index';
import bodyPix from './BodyPix/index';
import neuralNetwork from './NeuralNetwork/index';
import faceApi from './FaceApi/index';
import kmeans from './KMeans/index';
import p5Utils from './utils/p5Utils';

const withPreload = {
  charRNN,
  CVAE,
  DCGAN,
  featureExtractor,
  imageClassifier,
  kmeans,
  soundClassifier,
  pitchDetection,
  pix2pix,
  poseNet,
  sketchRNN,
  styleTransfer,
  word2vec,
  YOLO,
  objectDetector,
  uNet,
  sentiment,
  bodyPix,
  faceApi,
};

const ml5 = Object.assign({p5Utils}, preloadRegister(withPreload), {
  KNNClassifier,
  ...imageUtils,
  tf,
  tfvis,
  version,
  neuralNetwork,
});

export default ml5;