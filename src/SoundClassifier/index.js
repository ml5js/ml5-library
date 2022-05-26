// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Sound Classifier using pre-trained networks
*/

import * as tf from '@tensorflow/tfjs';
import handleArguments from "../utils/handleArguments";
import * as speechCommands from './speechcommands';
import callCallback from '../utils/callcallback';

const MODEL_OPTIONS = ['speechcommands18w'];
class SoundClassifier {
  /**
   * Create an SoundClassifier.
   * @param {modelNameOrUrl} modelNameOrUrl - The name or the URL of the model to use. Current name options
   *    are: 'SpeechCommands18w'.
   * @param {object} options - An object with options.
   * @param {function} callback - A callback to be called when the model is ready.
   */
  constructor(modelNameOrUrl, options, callback) {
    this.model = null;
    this.options = options;
    if (typeof modelNameOrUrl === 'string') {
      if (MODEL_OPTIONS.includes(modelNameOrUrl)) {
        this.modelName = modelNameOrUrl;
        this.modelUrl = null;
        switch (this.modelName) {
          case 'speechcommands18w':
            this.modelToUse = speechCommands;
            break;
          default:
            this.modelToUse = null;
        }
      } else {
        // Default to speechCommands for now
        this.modelToUse = speechCommands;
        this.modelUrl = modelNameOrUrl;
      }
    }
    // Load the model
    this.ready = callCallback(this.loadModel(options, this.modelUrl), callback);
  }

  async loadModel(options) {
    this.model = await this.modelToUse.load(options, this.modelUrl);
    return this;
  }

  async classifyInternal(numberOfClasses, callback) {
    // Wait for the model to be ready
    await this.ready;
    await tf.nextFrame();

    return this.model.classify(numberOfClasses, callback);
  }

  /**
   * Classifies the audio from microphone and takes a callback to handle the results
   * @param {function | number} numOrCallback -
   *    takes any of the following params
   * @param {function} cb - a callback function that handles the results of the function.
   * @return {function} a promise or the results of a given callback, cb.
   */
  async classify(numOrCallback = null, cb) {
    const args = handleArguments(numOrCallback, cb);
    const numberOfClasses = args.number || this.topk;

    return this.classifyInternal(numberOfClasses, args.callback);
  }
}

const soundClassifier = (modelName, optionsOrCallback, cb) => {
  const { string, options = {}, callback } = handleArguments(modelName, optionsOrCallback, cb)
    .require('string', 'Please specify a model to use. E.g: "SpeechCommands18w"');

  let model = string;
  // TODO: I think we should delete this. -Linda
  if (model.indexOf('http') === -1) {
    model = model.toLowerCase();
  }

  const instance = new SoundClassifier(model, options, callback);
  return callback ? instance : instance.ready;
};

export default soundClassifier;
