// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
BodyPix
*/


import * as tf from '@tensorflow/tfjs';
// import * as bp from '@tensorflow-models/body-pix';
import callCallback from '../utils/callcallback';
// import Video from '../utils/Video';

const DEFAULTS = {
    "outputStride": 16,
    "segmentationThreshold": 0.5
}

class BodyPix {
    constructor(video, options, callback) {
        this.video = video;
        this.model = null;
        this.modelReady = false;
        this.modelPath = ''
        this.config = {
            outputStride: options.outputStride || DEFAULTS.outputStride,
            segmentationThreshold: options.segmentationThreshold || DEFAULTS.segmentationThreshold,
        }

        this.ready = callCallback(this.loadModel(), callback);
    }

    async loadModel(){
        this.model = await tf.loadLayersModel(this.modelPath);
        return this;
    }
}

const bodyPix = (videoOrOptionsOrCallback, optionsOrCallback, cb) => {
    let video;
    let options = {};
    let callback = cb;

    if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
        video = videoOrOptionsOrCallback;
    } else if (
        typeof videoOrOptionsOrCallback === 'object' &&
        videoOrOptionsOrCallback.elt instanceof HTMLVideoElement
    ) {
        video = videoOrOptionsOrCallback.elt; // Handle a p5.js video element
    } else if (typeof videoOrOptionsOrCallback === 'object') {
        options = videoOrOptionsOrCallback;
    } else if (typeof videoOrOptionsOrCallback === 'function') {
        callback = videoOrOptionsOrCallback;
    }

    if (typeof optionsOrCallback === 'object') {
        options = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'function') {
        callback = optionsOrCallback;
    }

    const instance = new BodyPix(video, options, callback);
    return callback ? instance : instance.ready;
}

export default bodyPix;