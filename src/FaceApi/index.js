// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */

/*
 * FaceApi: real-time face recognition, expressions, and landmark detection
 * Ported and integrated from all the hard work by: https://github.com/justadudewhohacks/face-api.js?files=1
 */

import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import callCallback from '../utils/callcallback';
// import * as p5Utils from '../utils/p5Utils';

// const DEFAULTS = {
//     MODEL_URL: ''
// }

class FaceApiBase {
    /**
     * Create FaceApi.
     * @param {HTMLVideoElement} video - An HTMLVideoElement.
     * @param {object} options - An object with options.
     * @param {function} callback - A callback to be called when the model is ready.
     */
    constructor(modelPath, video, options, callback) {
        this.video = video;
        this.model = null;
        this.modelReady = false;
        this.modelPath = modelPath;
        this.config = {}

        this.ready = callCallback(this.loadModel(), callback);
    }

    /**
     * Load the model and set it to this.model
     * @return {this} the BodyPix model.
     */
    async loadModel() {
        this.model = faceapi;
        await this.model.loadSsdMobilenetv1Model(this.modelPath)
        await this.model.loadFaceLandmarkModel(this.modelPath)
        await this.model.loadFaceRecognitionModel(this.modelPath)
        await this.model.loadFaceExpressionModel(this.modelPath)
        console.log('done!')
        this.modelReady = true;
        return this;
    }

    async classifyExpressionsMultipleInternal(imgToClassify){
        await this.ready;
        await tf.nextFrame();

        if (this.video && this.video.readyState === 0) {
            await new Promise(resolve => {
                this.video.onloadeddata = () => resolve();
            });
        }

        const expression = await this.model.detectAllFaces(imgToClassify).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
        return expression
    }

    async classifyExpressionsMultiple(optionsOrCallback, configOrCallback, cb){
        let imgToClassify = this.video;
        let callback;
        // let segmentationOptions = this.config;

        // Handle the image to predict
        if (typeof optionsOrCallback === 'function') {
            imgToClassify = this.video;
            callback = optionsOrCallback;
            // clean the following conditional statement up!
        } else if (optionsOrCallback instanceof HTMLImageElement) {
            imgToClassify = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLImageElement
        ) {
            imgToClassify = optionsOrCallback.elt; // Handle p5.js image
        } else if (optionsOrCallback instanceof HTMLCanvasElement) {
            imgToClassify = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLCanvasElement
        ) {
            imgToClassify = optionsOrCallback.elt; // Handle p5.js image
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.canvas instanceof HTMLCanvasElement
        ) {
            imgToClassify = optionsOrCallback.canvas; // Handle p5.js image
        } else if (!(this.video instanceof HTMLVideoElement)) {
            // Handle unsupported input
            throw new Error(
                'No input image provided. If you want to classify a video, pass the video element in the constructor. ',
            );
        }

        // if (typeof configOrCallback === 'object') {
        //     segmentationOptions = configOrCallback;
        // } else 
        
        if (typeof configOrCallback === 'function') {
            callback = configOrCallback;
        }

        if (typeof cb === 'function') {
            callback = cb;
        }

        return callCallback(this.classifyExpressionsMultipleInternal(imgToClassify), callback);

    }

    async classifyExpressionsSingleInternal(imgToClassify){
        await this.ready;
        await tf.nextFrame();

        if (this.video && this.video.readyState === 0) {
            await new Promise(resolve => {
                this.video.onloadeddata = () => resolve();
            });
        }

        const expression = await this.model.detectSingleFace(imgToClassify).withFaceLandmarks().withFaceExpressions().withFaceDescriptor()
        return expression
    }

    async classifyExpressionsSingle(optionsOrCallback, configOrCallback, cb){
        let imgToClassify = this.video;
        let callback;
        // let segmentationOptions = this.config;

        // Handle the image to predict
        if (typeof optionsOrCallback === 'function') {
            imgToClassify = this.video;
            callback = optionsOrCallback;
            // clean the following conditional statement up!
        } else if (optionsOrCallback instanceof HTMLImageElement) {
            imgToClassify = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLImageElement
        ) {
            imgToClassify = optionsOrCallback.elt; // Handle p5.js image
        } else if (optionsOrCallback instanceof HTMLCanvasElement) {
            imgToClassify = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLCanvasElement
        ) {
            imgToClassify = optionsOrCallback.elt; // Handle p5.js image
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.canvas instanceof HTMLCanvasElement
        ) {
            imgToClassify = optionsOrCallback.canvas; // Handle p5.js image
        } else if (!(this.video instanceof HTMLVideoElement)) {
            // Handle unsupported input
            throw new Error(
                'No input image provided. If you want to classify a video, pass the video element in the constructor. ',
            );
        }

        // if (typeof configOrCallback === 'object') {
        //     segmentationOptions = configOrCallback;
        // } else 
        
        if (typeof configOrCallback === 'function') {
            callback = configOrCallback;
        }

        if (typeof cb === 'function') {
            callback = cb;
        }

        return callCallback(this.classifyExpressionsSingleInternal(imgToClassify), callback);

    }

}

const faceApi = (modelPath, videoOrOptionsOrCallback, optionsOrCallback, cb) => {
    let video;
    let options = {};
    let callback = cb;

    if (typeof modelPath !== 'string') {
        throw new Error('Please specify a relative path to your model to use. E.g: "/models/"');
    }

   const model = modelPath;

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

    const instance = new FaceApiBase(model, video, options, callback);
    return callback ? instance : instance.ready;
}

export default faceApi;