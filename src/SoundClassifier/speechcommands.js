// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tfjsSpeechCommands from '@tensorflow-models/speech-commands';

async function getTopKClasses(values, topK, classes) {
  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i += 1) {
    valuesAndIndices.push({
      value: values[i],
      index: i,
    });
  }
  valuesAndIndices.sort((a, b) => b.value - a.value);

  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i += 1) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i += 1) {
    topClassesAndProbs.push({
      label: classes[topkIndices[i]],
      confidence: topkValues[i],
    });
  }
  return topClassesAndProbs;
}

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

export async function load(options) {
  const speechCommandsModel = new SpeechCommands(options);
  await speechCommandsModel.load();
  return speechCommandsModel;
}
