// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
SketchRNN
*/

import * as ms from '@magenta/sketch';
import callCallback from '../utils/callcallback';

class SketchRNN {
    constructor(checkpointUrl, callback) {
        this.ready = false;
        this.defaults = {
            temperature: 0.65
        }
        this.model = new ms.SketchRNN(checkpointUrl);
        this.penState = this.model.zeroInput();
        this.rnnState = this.model.zeroState();
        this.ready = callCallback(this.model.initialize(), callback);
    }

    async generateInternal(options, strokes) {
        const temperature = +options.temperature || this.defaults.temperature;

        if (strokes !== undefined) {
            this.model.updateStrokes(strokes, this.rnnState);
        }
        this.rnnState = this.model.update(this.penState, this.rnnState);
        let pdf = this.model.getPDF(this.rnnState, temperature);
        this.penState = this.model.sample(pdf);
        return this.penState;
    }

    async generate(options, strokes, callback) {
        return callCallback(this.generateInternal(options, strokes), callback);
    }
}
