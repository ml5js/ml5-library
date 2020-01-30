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
import modelLoader from '../utils/modelLoader';

// const PATH_START_LARGE = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/';
// const PATH_START_SMALL = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/';
// const PATH_END = '.gen.json';


const DEFAULTS = {
  modelPath: 'https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/',
  modelPath_large: 'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/',
  modelPath_small: 'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/',
  PATH_END: '.gen.json',
  temperature: 0.65,
  pixelFactor: 3.0,
}

class SketchRNN {
  /**
   * Create SketchRNN. 
   * @param {String} model - The name of the sketch model to be loaded.
   *    The names can be found in the models.js file
   * @param {function} callback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise 
   *    that will be resolved once the model has loaded.
   */
  constructor(model, callback, large = true) {
    let checkpointUrl = model;

    this.config = {
      temperature: 0.65,
      pixelFactor: 3.0,
      modelPath: DEFAULTS.modelPath,
      modelPath_small: DEFAULTS.modelPath_small,
      modelPath_large: DEFAULTS.modelPath_large,
      PATH_END: DEFAULTS.PATH_END,
    };
    
    
    if(modelLoader.isAbsoluteURL(checkpointUrl) === true){
      const modelPath = modelLoader.getModelPath(checkpointUrl);
      this.config.modelPath = modelPath;

    } else if(modelPaths.has(checkpointUrl)) {
        checkpointUrl = (large ? this.config.modelPath : this.config.modelPath_small) + checkpointUrl + this.config.PATH_END;
        this.config.modelPath = checkpointUrl;
    } else {
      console.log('no model found!');
      return this;
    }

    this.model = new ms.SketchRNN(this.config.modelPath);
    this.penState = this.model.zeroInput();
    this.ready = callCallback(this.model.initialize(), callback);
  }

  async generateInternal(options, strokes) {
    const temperature = +options.temperature || this.config.temperature;
    const pixelFactor = +options.pixelFactor || this.config.pixelFactor;

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
    const result = {
      dx: this.penState[0],
      dy: this.penState[1],
    };
    if (this.penState[2] === 1) {
      result.pen = 'down';
    } else if (this.penState[3] === 1) {
      result.pen = 'up';
    } else if (this.penState[4] === 1) {
      result.pen = 'end';
    }
    return result;
  }

  async generate(optionsOrSeedOrCallback, seedOrCallback, cb) {
    let callback;
    let options;
    let seedStrokes;

    if (typeof optionsOrSeedOrCallback === 'function') {
      options = {};
      seedStrokes = [];
      callback = optionsOrSeedOrCallback;
    } else if (Array.isArray(optionsOrSeedOrCallback)) {
      options = {};
      seedStrokes = optionsOrSeedOrCallback;
      callback = seedOrCallback;
    } else if (typeof seedOrCallback === 'function') {
      options = optionsOrSeedOrCallback || {};
      seedStrokes = [];
      callback = seedOrCallback;
    } else {
      options = optionsOrSeedOrCallback || {};
      seedStrokes = seedOrCallback || [];
      callback = cb;
    }

    const strokes = seedStrokes.map(s => {
      const up = s.pen === 'up' ? 1 : 0;
      const down = s.pen === 'down' ? 1 : 0;
      const end = s.pen === 'end' ? 1 : 0;
      return [s.dx, s.dy, down, up, end];
    });
    return callCallback(this.generateInternal(options, strokes), callback);
  }

  reset() {
    this.penState = this.model.zeroInput();
    if (this.rnnState) {
      this.rnnState = this.model.zeroState();
    }
  }
}

const sketchRNN = (model, callback, large = true) => new SketchRNN(model, callback, large);

export default sketchRNN;
