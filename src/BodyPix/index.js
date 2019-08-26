// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */

/*
 * BodyPix: Real-time Person Segmentation in the Browser
 * Ported and integrated from all the hard work by: https://github.com/tensorflow/tfjs-models/tree/master/body-pix
 */

import * as tf from '@tensorflow/tfjs';
import * as bp from '@tensorflow-models/body-pix';
import callCallback from '../utils/callcallback';
import p5Utils from '../utils/p5Utils';

const DEFAULTS = {
    "multiplier": 0.75,
    "outputStride": 16,
    "segmentationThreshold": 0.5,
    "palette": {
        // "none": {
        //     "id": -1,
        //     "color": [0, 0, 0]
        // },
        "leftFace": {
            "id": 0,
            "color": [110, 64, 170]
        },
        "rightFace": {
            "id": 1,
            "color": [106, 72, 183]
        },
        "rightUpperLegFront": {
            "id": 2,
            "color": [100, 81, 196]
        },
        "rightLowerLegBack": {
            "id": 3,
            "color": [92, 91, 206]
        },
        "rightUpperLegBack": {
            "id": 4,
            "color": [84, 101, 214]
        },
        "leftLowerLegFront": {
            "id": 5,
            "color": [75, 113, 221]
        },
        "leftUpperLegFront": {
            "id": 6,
            "color": [66, 125, 224]
        },
        "leftUpperLegBack": {
            "id": 7,
            "color": [56, 138, 226]
        },
        "leftLowerLegBack": {
            "id": 8,
            "color": [48, 150, 224]
        },
        "rightFeet": {
            "id": 9,
            "color": [40, 163, 220]
        },
        "rightLowerLegFront": {
            "id": 10,
            "color": [33, 176, 214]
        },
        "leftFeet": {
            "id": 11,
            "color": [29, 188, 205]
        },
        "torsoFront": {
            "id": 12,
            "color": [26, 199, 194]
        },
        "torsoBack": {
            "id": 13,
            "color": [26, 210, 182]
        },
        "rightUpperArmFront": {
            "id": 14,
            "color": [28, 219, 169]
        },
        "rightUpperArmBack": {
            "id": 15,
            "color": [33, 227, 155]
        },
        "rightLowerArmBack": {
            "id": 16,
            "color": [41, 234, 141]
        },
        "leftLowerArmFront": {
            "id": 17,
            "color": [51, 240, 128]
        },
        "leftUpperArmFront": {
            "id": 18,
            "color": [64, 243, 116]
        },
        "leftUpperArmBack": {
            "id": 19,
            "color": [79, 246, 105]
        },
        "leftLowerArmBack": {
            "id": 20,
            "color": [96, 247, 97]
        },
        "rightHand": {
            "id": 21,
            "color": [115, 246, 91]
        },
        "rightLowerArmFront": {
            "id": 22,
            "color": [134, 245, 88]
        },
        "leftHand": {
            "id": 23,
            "color": [155, 243, 88]
        }
    }
}

class BodyPix {
    /**
     * Create BodyPix.
     * @param {HTMLVideoElement} video - An HTMLVideoElement.
     * @param {object} options - An object with options.
     * @param {function} callback - A callback to be called when the model is ready.
     */
    constructor(video, options, callback) {
        this.video = video;
        this.model = null;
        this.modelReady = false;
        this.modelPath = ''
        this.config = {
            multiplier: options.multiplier || DEFAULTS.multiplier,
            outputStride: options.outputStride || DEFAULTS.outputStride,
            segmentationThreshold: options.segmentationThreshold || DEFAULTS.segmentationThreshold,
            palette: options.palette || DEFAULTS.palette
        }

        this.ready = callCallback(this.loadModel(), callback);
    }

    /**
     * Load the model and set it to this.model
     * @return {this} the BodyPix model.
     */
    async loadModel() {
        this.model = await bp.load(this.config.multiplier);
        this.modelReady = true;
        return this;
    }

    /**
     * Returns an rgb array
     * @param {Object} a p5.Color obj
     * @return {Array} an [r,g,b] array
     */
    /* eslint class-methods-use-this: "off" */
    p5Color2RGB(p5ColorObj) {
        const regExp = /\(([^)]+)\)/;
        const match = regExp.exec(p5ColorObj.toString('rgb'));
        const [r, g, b] = match[1].split(',')
        return [r, g, b]
    }

    /**
     * Returns a bodyPartsSpec object 
     * @param {Array} an array of [r,g,b] colors
     * @return {object} an object with the bodyParts by color and id
     */
    /* eslint class-methods-use-this: "off" */
    bodyPartsSpec(colorOptions) {
        const result = colorOptions !== undefined || Object.keys(colorOptions).length >= 24 ? colorOptions : this.config.palette;

        // Check if we're getting p5 colors, make sure they are rgb 
        if (p5Utils.checkP5() && result !== undefined && Object.keys(result).length >= 24) {
            // Ensure the p5Color object is an RGB array
            Object.keys(result).forEach(part => {
                if (result[part].color instanceof window.p5.Color) {
                    result[part].color = this.p5Color2RGB(result[part].color);
                } else {
                    result[part].color = result[part].color;
                }
            });
        }

        return result;
    }

    /**
     * Segments the image with partSegmentation, return result object
     * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} imageToSegment - 
     *    takes any of the following params
     * @param {object} segmentationOptions - config params for the segmentation
     *    includes outputStride, segmentationThreshold
     * @return {Object} a result object with image, raw, bodyParts
     */
    async segmentWithPartsInternal(imgToSegment, segmentationOptions) {
        // estimatePartSegmentation
        await this.ready;
        await tf.nextFrame();

        if (this.video && this.video.readyState === 0) {
            await new Promise(resolve => {
                this.video.onloadeddata = () => resolve();
            });
        }

        this.config.palette = segmentationOptions.palette || this.config.palette;
        this.config.outputStride = segmentationOptions.outputStride || this.config.outputStride;
        this.config.segmentationThreshold = segmentationOptions.segmentationThreshold || this.config.segmentationThreshold;

        const bodyPartsMeta = this.bodyPartsSpec(this.config.palette);
        const segmentation = await this.model.estimatePartSegmentation(imgToSegment, this.config.outputStride, this.config.segmentationThreshold);

        const colorsArray = Object.keys(bodyPartsMeta).map(part => bodyPartsMeta[part].color)

        const result = {};
        result.image = bp.toColoredPartImageData(segmentation, colorsArray);
        result.raw = segmentation;
        result.bodyParts = bodyPartsMeta;

        if (p5Utils.checkP5()) {
            const blob1 = await p5Utils.rawToBlob(result.image.data, segmentation.width, segmentation.height);
            const p5Image1 = await p5Utils.blobToP5Image(blob1);
            result.image = p5Image1;
        }

        return result;

    }

    /**
     * Segments the image with partSegmentation
     * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} optionsOrCallback - 
     *    takes any of the following params
     * @param {object} configOrCallback - config params for the segmentation
     *    includes palette, outputStride, segmentationThreshold
     * @param {function} cb - a callback function that handles the results of the function.
     * @return {function} a promise or the results of a given callback, cb.
     */
    async segmentWithParts(optionsOrCallback, configOrCallback, cb) {
        let imgToSegment = this.video;
        let callback;
        let segmentationOptions = this.config;

        // Handle the image to predict
        if (typeof optionsOrCallback === 'function') {
            imgToSegment = this.video;
            callback = optionsOrCallback;
            // clean the following conditional statement up!
        } else if (optionsOrCallback instanceof HTMLImageElement 
            || optionsOrCallback instanceof HTMLCanvasElement 
            || optionsOrCallback instanceof ImageData) {
                imgToSegment = optionsOrCallback;
        } else if (typeof optionsOrCallback === 'object' && (optionsOrCallback.elt instanceof HTMLImageElement 
            || optionsOrCallback.elt instanceof HTMLCanvasElement 
            || optionsOrCallback.elt instanceof ImageData)){
                
                if(optionsOrCallback.canvas instanceof HTMLCanvasElement){
                    imgToSegment = optionsOrCallback.canvas; // Handle p5.js image
                } else {
                    imgToSegment = optionsOrCallback.elt; // Handle p5.js image
                }
        } else if (!(this.video instanceof HTMLVideoElement)) {
            // Handle unsupported input
            throw new Error(
                'No input image provided. If you want to classify a video, pass the video element in the constructor. ',
            );
        }

        if (typeof configOrCallback === 'object') {
            segmentationOptions = configOrCallback;
        } else if (typeof configOrCallback === 'function') {
            callback = configOrCallback;
        }

        if (typeof cb === 'function') {
            callback = cb;
        }

        return callCallback(this.segmentWithPartsInternal(imgToSegment, segmentationOptions), callback);

    }

    /**
     * Segments the image with personSegmentation, return result object
     * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} imageToSegment - 
     *    takes any of the following params
     * @param {object} segmentationOptions - config params for the segmentation
     *    includes outputStride, segmentationThreshold
     * @return {Object} a result object with maskBackground, maskPerson, raw
     */
    async segmentInternal(imgToSegment, segmentationOptions) {

        await this.ready;
        await tf.nextFrame();

        if (this.video && this.video.readyState === 0) {
            await new Promise(resolve => {
                this.video.onloadeddata = () => resolve();
            });
        }

        this.config.outputStride = segmentationOptions.outputStride || this.config.outputStride;
        this.config.segmentationThreshold = segmentationOptions.segmentationThreshold || this.config.segmentationThreshold;

        const segmentation = await this.model.estimatePersonSegmentation(imgToSegment, this.config.outputStride, this.config.segmentationThreshold)

        const result = {};
        result.maskBackground = bp.toMaskImageData(segmentation, true);
        result.maskPerson = bp.toMaskImageData(segmentation, false);
        result.raw = segmentation;

        if (p5Utils.checkP5()) {
            const blob1 = await p5Utils.rawToBlob(result.maskBackground.data, segmentation.width, segmentation.height);
            const blob2 = await p5Utils.rawToBlob(result.maskPerson.data, segmentation.width, segmentation.height);
            const p5Image1 = await p5Utils.blobToP5Image(blob1);
            const p5Image2 = await p5Utils.blobToP5Image(blob2);

            result.maskBackground = p5Image1;
            result.maskPerson = p5Image2;
        }

        return result;

    }

    /**
     * Segments the image with personSegmentation
     * @param {HTMLImageElement | HTMLCanvasElement | object | function | number} optionsOrCallback - 
     *    takes any of the following params
     * @param {object} configOrCallback - config params for the segmentation
     *    includes outputStride, segmentationThreshold
     * @param {function} cb - a callback function that handles the results of the function.
     * @return {function} a promise or the results of a given callback, cb.
     */
    async segment(optionsOrCallback, configOrCallback, cb) {
        let imgToSegment = this.video;
        let callback;
        let segmentationOptions = this.config;
        
        // Handle the image to predict
        if (typeof optionsOrCallback === 'function') {
            imgToSegment = this.video;
            callback = optionsOrCallback;
            // clean the following conditional statement up!
        } else if (optionsOrCallback instanceof HTMLImageElement 
            || optionsOrCallback instanceof HTMLCanvasElement 
            || optionsOrCallback instanceof ImageData) {
                imgToSegment = optionsOrCallback;
        } else if (typeof optionsOrCallback === 'object' && (optionsOrCallback.elt instanceof HTMLImageElement 
            || optionsOrCallback.elt instanceof HTMLCanvasElement 
            || optionsOrCallback.elt instanceof ImageData)){
            imgToSegment = optionsOrCallback.elt; // Handle p5.js image
        } else if (typeof optionsOrCallback === 'object' && optionsOrCallback.canvas instanceof HTMLCanvasElement) {
            imgToSegment = optionsOrCallback.canvas; // Handle p5.js image
        } else if (!(this.video instanceof HTMLVideoElement)) {
            // Handle unsupported input
            throw new Error(
                'No input image provided. If you want to classify a video, pass the video element in the constructor. ',
            );
        }

        if (typeof configOrCallback === 'object') {
            segmentationOptions = configOrCallback;
        } else if (typeof configOrCallback === 'function') {
            callback = configOrCallback;
        }

        if (typeof cb === 'function') {
            callback = cb;
        }

        return callCallback(this.segmentInternal(imgToSegment, segmentationOptions), callback);
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