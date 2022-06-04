// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
SketchRNN
*/

import * as ms from '@magenta/sketch';
import callCallback from '../utils/callcallback';
import handleArguments from '../utils/handleArguments';
import { getModelPath } from '../utils/modelLoader';
import modelPaths from './models';

// const PATH_START_LARGE = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/';
// const PATH_START_SMALL = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/';
// const PATH_END = '.gen.json';


const DEFAULTS = {
  // TODO: this doesn't look right... -Linda
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
   * @param {boolean} large
   */
  constructor(model, callback, large = true) {

    this.config = {
      temperature: 0.65,
      pixelFactor: 3.0,
      // TODO: it doesn't make sense for these to be instance properties -Linda
      modelPath: DEFAULTS.modelPath,
      modelPath_small: DEFAULTS.modelPath_small,
      modelPath_large: DEFAULTS.modelPath_large,
      PATH_END: DEFAULTS.PATH_END,
    };

    if (model.toLowerCase().endsWith('.json')) {
      this.config.modelPath = getModelPath(model);
    } else if(modelPaths.has(model)) {
      const base = large ? this.config.modelPath : this.config.modelPath_small;
      this.config.modelPath = base + model + this.config.PATH_END;
    } else {
      throw new Error(`Provided model ${model} is not a valid SketchRNN model name or a URL of a .json file.`);
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
    const args = handleArguments(optionsOrSeedOrCallback, seedOrCallback, cb);

    const seedStrokes = args.array || [];
    const strokes = seedStrokes.map(s => {
      const up = s.pen === 'up' ? 1 : 0;
      const down = s.pen === 'down' ? 1 : 0;
      const end = s.pen === 'end' ? 1 : 0;
      return [s.dx, s.dy, down, up, end];
    });
    return callCallback(this.generateInternal(args.options || {}, strokes), args.callback);
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
