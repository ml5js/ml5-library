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
import p5Utils from '../utils/p5Utils';

const modelPath = {
    'hosoda': 'https://raw.githubusercontent.com/leemengtaiwan/tfjs-models/master/cartoongan/tfjs_json_models/hosoda/model.json',
    'miyazaki': 'https://raw.githubusercontent.com/Derek-Wds/training_CartoonGAN/master/tfModels/Miyazaki/model.json'
};

class Cartoon {
    /**
     * Create a CartoonGan model.
     * @param {String} modelIdentifier - Required. The name of pre-inluded model or the url path to your model.
     * @param {function} callback - Required. A function to run once the model has been loaded.
     */
    constructor(modelIdentifier, callback) {
        this.modelUrl = modelPath[modelIdentifier] ? modelPath[modelIdentifier] : modelIdentifier;
        this.ready = false;
        this.model = {};
        this.ready = callCallback(this.loadModel(this.modelUrl), callback);
    }

    /* load tfjs model that is converted by tensorflowjs with graph and weights */
    async loadModel(modelUrl) {
        this.model = await tf.loadGraphModel(modelUrl);
        return this;
    }


    // todo: add p5 image support as input
    /**
     * generate an img based on input Image.
     * @param {HTMLImageElement | HTMLCanvasElement} src the source img you want to transfer.
     * @param {function} callback
     */
    async generate(src, callback) {
        if( !(src instanceof HTMLImageElement || src instanceof HTMLCanvasElement) ){
            throw new Error (`Invalid input type: ${typeof(src)}\nExpected HTMLImgElement, p5Image or HTMLCanvasElement`);
        }
        await this.ready;
        return callCallback(this.generateInternal(src), callback);
    }

    async generateInternal(src) {
        await this.ready;
        let img = tf.browser.fromPixels(src);
        if (img.shape[0] !== 256 || img.shape[1] !== 256) {
            throw new Error(`Input size should be 256*256 but ${img.shape} is found`);
        } else if (img.shape[2] !== 3) {
            throw new Error(`Input color channel number should be 3 but ${img.shape[2]} is found`);
        }
        img = img.sub(127.5).div(127.5).reshape([1, 256, 256, 3]);

<<<<<<< HEAD
        let res = this.model.predict(img);
        res = res.add(1).mul(127.5).reshape([256, 256, 3]);
        const result = this.resultFinalize(res);
        return result;
        
=======
        try {
            let res = this.model.predict(img);
        } catch(err) {
            console.error(err); // error handling?
        } finally {
            res = res.add(1).mul(127.5).reshape([256, 256, 3]);
            const result = await this.resultFinalize(res);
            return result;
        }
>>>>>>> 01fe3281020213fd5cb809d11a0791338e293644
    }

    /* eslint class-methods-use-this: "off" */
    async resultFinalize(res){
        const tensor = res;
        const raw = await res.data();
        const blob = await p5Utils.rawToBlob(res, res.shape[0], res.shape[1]);
        const image = await p5Utils.blobToP5Image(blob);
        return {tensor, raw, blob, image};
    }
} 

const cartoon = (model, callback) => new Cartoon(model, callback);

export default cartoon; 