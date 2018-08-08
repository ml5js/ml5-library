// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ['error', {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: 'off' */
/*
SketchRNN
*/

import * as ms from '@magenta/sketch';
import callCallback from '../utils/callcallback';
import modelPaths from './models';

const PATH_START_LARGE = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/';
const PATH_START_SMALL = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/';
const PATH_END = '.gen.json';

export default class SketchRNN {
  constructor(model, callback, large = true) {
    let checkpointUrl = model;
    if (modelPaths.has(checkpointUrl)) {
      checkpointUrl = (large ? PATH_START_LARGE : PATH_START_SMALL) + checkpointUrl + PATH_END;
    }
    this.defaults = {
      temperature: 0.65,
      pixelFactor: 3.0,
    };
    this.model = new ms.SketchRNN(checkpointUrl);
    this.penState = this.model.zeroInput();
    this.ready = callCallback(this.model.initialize(), callback);
  }

  async generateInternal(options, strokes) {
    const temperature = +options.temperature || this.defaults.temperature;
    const pixelFactor = +options.pixelFactor || this.defaults.pixelFactor;

    await this.ready;
    if (!this.rnnState) {
      this.rnnState = this.model.zeroState();
      this.model.setPixelFactor(pixelFactor);
    }

    if (Array.isArray(strokes) && strokes.length) {
      this.rnnState = this.model.updateStrokes(strokes, this.rnnState);
    }
    this.rnnState = this.model.update(this.penState, this.rnnState);
    const pdf = this.model.getPDF(this.rnnState, temperature);
    this.penState = this.model.sample(pdf);
    return this.penState;
  }

  async generate(options, strokes, callback) {
    return callCallback(this.generateInternal(options, strokes), callback);
  }

  reset() {
    this.penState = this.model.zeroInput();
    if (this.rnnState) {
      this.rnnState = this.model.zeroState();
    }
  }
}
