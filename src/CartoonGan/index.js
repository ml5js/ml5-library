// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
* CartoonGAN: see details about the [paper](http://openaccess.thecvf.com/content_cvpr_2018/papers/Chen_CartoonGAN_Generative_Adversarial_CVPR_2018_paper.pdf)
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';

const modelPath = {
    'Miyazaki': 'https://raw.githubusercontent.com/Derek-Wds/training_CartoonGAN/master/tfModels/Miyazaki/model.json'
};

class Cartoon {
    /**
     * Create a CartoonGan model.
     * @param {String} modelPath - Required. The url path to your model.
     * @param {function} callback - Required. A function to run once the model has been loaded.
     */
    constructor(model, callback) {
        this.modelUrl = modelPath[model] ? modelPath[model] : model;
        this.ready = false;
        this.model = {};
        this.ready = callCallback(this.loadModel(this.modelUrl), callback);
    }

    // load tfjs model that is converted by tensorflowjs with graph and weights
    async loadModel(modelUrl) {
        this.model = await tf.loadGraphModel(modelUrl);
        return this;
    }
    /**
     * generate an img based on input Image.
     * @param {HTMLImgElement} src the source img you want to transfer.
     * @param {function} callback
     */
    async generate(src, callback) {
        await this.ready;
        return callCallback(this.generateInternal(src), callback);
    }

    async generateInternal(src) {
        await this.ready;
        let img = tf.browser.fromPixels(src);
        if (img.shape[0] !== 256 || img.shape[1] !== 256) {
            throw new Error(`Input size should be 256*256 but ${img.shape} is found`);
        }
        img = img.sub(127.5).div(127.5).reshape([1, 256, 256, 3]);
        let res = this.model.predict(img);
        const blob = tf.browser.fromPixels(res.add(1).mul(2).reshape([256, 256, 3]));
        res = res.add(1).mul(127.5);
        return {res, blob};
    }
} 

const cartoon = (model, callback) => new Cartoon(model, callback);

export default cartoon;