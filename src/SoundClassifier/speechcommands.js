// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tfjsSpeechCommands from '@tensorflow-models/speech-commands';
import { getTopKClassesFromArray } from '../utils/gettopkclasses';

export class SpeechCommands {
  constructor(options) {
    this.options = options;
  }

  async load() {
    this.model = tfjsSpeechCommands.create('BROWSER_FFT');
    await this.model.ensureModelLoaded();
    this.allLabels = this.model.wordLabels();
  }

  async classify(topk = this.allLabels.length, cb) {
    return this.model.listen(async result => {
      if (result.scores) {
        const classes = await getTopKClassesFromArray(result.scores, topk, this.allLabels);
        return cb(null, classes);
      }
      return cb(`ERROR: Cannot find scores in result: ${result}`);
    }, this.options)
    .catch(err => {
      return cb(`ERROR: ${err.message}`);
    });
  }
}

export async function load(options) {
  const speechCommandsModel = new SpeechCommands(options);
  await speechCommandsModel.load();
  return speechCommandsModel;
}
