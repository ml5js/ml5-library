// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
DCGAN
This version is based on alantian's TensorFlow.js implementation: https://github.com/alantian/ganshowcase
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import {checkP5} from '../utils/p5Util';
import {rawToBlob} from '../utils/p5Util';
import {blobToP5Image} from '../utils/p5Util';
import {getBlob} from '../utils/p5Util';
import {loadAsync} from '../utils/p5Util';

let all_model_info = {
    face: {
        description: 'DCGAN, human faces, 64x64',
        model_url: "https://github.com/viztopia/ml5dcgan/blob/master/model/model.json",
        model_size: 64,
        model_latent_dim: 128
    }
};

class DCGAN{
    constructor(model_name, ready_cb){
        this.model_cache = {};
        this.model_name = model_name;
        this.model = null;
        this.ready = callCallback(this.loadModel(), ready_cb);
    }

    async loadModel() {
        let model_name = this.model_name;
        let model_info = all_model_info[model_name];
        let model_url = model_info.model_url;

        if (model_name in this.model_cache) {
            this.model = this.model_cache[model_name];
            return this;
        } else {
            this.model = await tf.loadLayersModel(model_url);
            this.model_cache[model_name] = this.model;
            return this;
        }
    }

    async generate(cb){
        return callCallback(this.generate_internal(), cb);
    }

    async generate_internal() {
        let model_info = all_model_info[this.model_name];
        let model_latent_dim = model_info.model_latent_dim;
        let model = await this.model;
        let image_tensor = await this.compute(model, model_latent_dim);

        //get the raw data from tensor
        let raw = await tf.browser.toPixels(image_tensor);

        //get the blob from raw
        const [imgHeight, imgWidth] = image_tensor.shape;
        let blob = await rawToBlob(raw, imgWidth, imgHeight);

        //get the p5.Image object
        let p5Image;
        if(checkP5()){
            p5Image = await blobToP5Image(blob);
        }

        //wrap up the final js result object
        let result =  {};
        result["blob"] = blob;
        result["raw"] = raw;
        result["tensor"] = image_tensor;

        if(checkP5()){
            result["image"] = p5Image;
        }

        return result;
    }

    async compute(model, latent_dim) {
        const y = tf.tidy(() => {
            const z = tf.randomNormal([1, latent_dim]);
            const y = model.predict(z).squeeze().transpose([1, 2, 0]).div(tf.scalar(2)).add(tf.scalar(0.5));
            return y;
        });

        return y;
    }
}
