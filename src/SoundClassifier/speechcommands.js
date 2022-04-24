// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tfjsSpeechCommands from '@tensorflow-models/speech-commands';
import getTopKClasses  from '../utils/gettopkclasses';

export class SpeechCommands {
  constructor(options) {
    this.options = options;
  }

  async load(url) {
    if (url) {
      const split = url.split("/");
      const prefix = split.slice(0, split.length - 1).join("/");
      const metadataJson = `${prefix}/metadata.json`;
      this.model = tfjsSpeechCommands.create('BROWSER_FFT', undefined, url, metadataJson);
    } else this.model = tfjsSpeechCommands.create('BROWSER_FFT');
    await this.model.ensureModelLoaded();
    this.allLabels = this.model.wordLabels();
  }

  classify(topk = this.allLabels.length, cb) {
    return this.model.listen(async (result) => {
      if (result.scores) {
        const classes = await getTopKClasses(result.scores, topk, this.allLabels);
        return cb(null, classes);
      }
      return cb(`ERROR: Cannot find scores in result: ${result}`);
    }, this.options)
      .catch(err => {
        return cb(`ERROR: ${err.message}`);
      });
  }
}

export async function load(options, url) {
  const speechCommandsModel = new SpeechCommands(options);
  await speechCommandsModel.load(url);
  return speechCommandsModel;
}
