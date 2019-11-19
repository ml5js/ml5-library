// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
    COCO-SSD Object detection
    Wraps the coco-ssd model in tfjs to be used in ml5
*/
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import callCallback from '../../utils/callcallback';
import {
    isInstanceOfSupportedElement
} from '../../utils/imageUtilities';

const DEFAULTS = {
    base: 'mobilenet_v2',
    modelUrl: undefined,
}

class CocoSsd {
    /**
     * Create CocoSsd model. Works on video and images. 
     * @param {function} constructorCallback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise
     *    that will be resolved once the model has loaded.
     */
    constructor(options, constructorCallback) {
        this.config = {
            base: options.base || DEFAULTS.base,
            modelUrl: options.modelUrl || DEFAULTS.modelUrl
        }
        this.constructorCallback = constructorCallback;
        this.ready = callCallback(this.loadModel(), constructorCallback);
    }

    async loadModel() {
        this.cocoSsdModel = await cocoSsd.load(this.config);

        this.modelReady = true;
        return this;
    }

    /**
     * @typedef {Object} ObjectDetectorPrediction
     * @property {number} x - top left x coordinate of the prediction box (0 to 1).
     * @property {number} y - top left y coordinate of the prediction box (0 to 1).
     * @property {number} w - width of the prediction box (0 to 1).
     * @property {number} h - height of the prediction box (0 to 1).
     * @property {string} label - the label given.
     * @property {number} confidence - the confidence score (0 to 1).
     */
    /**
     * Detect objects that are in video, returns bounding box, label, and confidence scores
     * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|ImageData} subject - Subject of the detection.
     */
    async detectInternal(imgToPredict) {

        const predictions = await this.cocoSsdModel.detect(imgToPredict);
        const formattedPredictions = predictions.map(prediction => {
            return {
                label: prediction.class,
                confidence: prediction.score,
                x: prediction.bbox[0],
                y: prediction.bbox[1],
                w: prediction.bbox[2],
                h: prediction.bbox[3],
            }
        })

        return formattedPredictions;
    }

    /**
     * Detect objects that are in video, returns bounding box, label, and confidence scores
     * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|ImageData} subject - Subject of the detection.
     * @param {function} callback - Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise
     *    that will be resolved once the prediction is done.
     */
    async detect(inputOrCallback, cb) {
        await this.ready;
        await tf.nextFrame();

        let imgToPredict;
        let callback = cb;

        if (isInstanceOfSupportedElement(inputOrCallback)) {
            imgToPredict = inputOrCallback;
        } else if (typeof inputOrCallback === "object" && isInstanceOfSupportedElement(inputOrCallback.elt)) {
            imgToPredict = inputOrCallback.elt; // Handle p5.js image and video.
        } else if (typeof inputOrCallback === "object" && isInstanceOfSupportedElement(inputOrCallback.canvas)) {
            imgToPredict = inputOrCallback.canvas; // Handle p5.js image and video.
        } else if (typeof inputOrCallback === "function") {
            imgToPredict = this.video;
            callback = inputOrCallback;
        }

        return callCallback(this.detectInternal(imgToPredict), callback);
    }
}

export default CocoSsd;