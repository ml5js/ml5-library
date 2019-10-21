// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
/* eslint max-len: ["error", { "code": 180 }] */

/*
    COCO-SSD Object detection
    Wraps the coco-ssd model in tfjs to be used in ml5
*/

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

class CocoSsd {
    /**
     * Create CocoSsd model. Works on video and images. 
     * @param {HTMLVideoElement} video - Optional. The video to be used for object detection and classification.
     * @param {Object} options - Optional. A set of options.
     * @param {function} callback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise 
     *    that will be resolved once the model has loaded.
     */
    constructor(video, options, callback) {
        this.isModelReady = false;
        this.video = video;
        this.options = options;
        this.callback = callback;
        cocoSsd.load().then(_cocoSsdModel => {
            this.cocoSsdModel = _cocoSsdModel;
            callback();
        });
    }

    detect(callback) {
        if (this.isModelReady) {
            this.cocoSsdModel.detect(this.video).then((predictions) => {
                let formattedPredictions = [];
                for (let i = 0; i < predictions.length; i++) {
                    const prediction = predictions[i];
                    formattedPredictions.push({
                        label: prediction.class,
                        confidence: prediction.score,
                        x: prediction.bbox[0],
                        y: prediction.bbox[1],
                        w: prediction.bbox[2],
                        h: prediction.bbox[3],
                    });
                }
                callback(false, formattedPredictions);
            })
        }
    }
}

export default CocoSsd;
