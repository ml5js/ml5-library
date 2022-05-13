// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
* CartoonGAN: see details about the [paper](http://openaccess.thecvf.com/content_cvpr_2018/papers/Chen_CartoonGAN_Generative_Adversarial_CVPR_2018_paper.pdf)
*/

import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import generatedImageResult from '../utils/generatedImageResult';
import handleArguments from '../utils/handleArguments';

const IMAGE_SIZE = 256;

const modelPath = {
  'hosoda': 'https://raw.githubusercontent.com/leemengtaiwan/tfjs-models/master/cartoongan/tfjs_json_models/hosoda/model.json',
  'miyazaki': 'https://raw.githubusercontent.com/Derek-Wds/training_CartoonGAN/master/tfModels/Miyazaki/model.json'
};

/**
 * @typedef {Object} CartoonOptions
 * @property {string} [modelUrl] - default 'miyazaki'
 * @property {boolean} [returnTensors] - default false
 */

class Cartoon {
  /**
   * TODO: accept video.
     * Create a CartoonGan model.
     * @param {CartoonOptions} options
     * @param {ML5Callback<Cartoon>} [callback]
     */
  constructor(options, callback) {
    this.config = {
      modelUrl: options.modelUrl ? options.modelUrl : modelPath.miyazaki,
      returnTensors: options.returnTensors ? options.returnTensors : false,
    }
    /**
     * @type {tf.GraphModel | {}}
     */
    this.model = {};
    this.ready = callCallback(this.loadModel(this.config.modelUrl), callback);
  }

  /**
   * @private
   * load tfjs model that is converted by tensorflowjs with graph and weights
   * @param {string} modelUrl
   * @return {Promise<Cartoon>}
   */
  async loadModel(modelUrl) {
    this.model = await tf.loadGraphModel(modelUrl);
    return this;
  }

  /**
   * @public
   * generate an image based on input image.
   * @param {(ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | p5.Image | p5.Element | ML5Callback<CartoonResult>)[]} [args] -
   * the source img you want to transfer and/or a callback function to call with the result.
   *
   * @typedef {Object} CartoonResult
   * @property {Uint8Array | Int32Array | Float32Array} raw - pixel values
   * @property {Blob} blob
   * @property {p5.Image | null} image - p5 Image if p5 is available
   * @property {tf.Tensor3D} [tensor] - if option `returnTensors` is true.
   *
   * @return {Promise<CartoonResult>}
   */
  async generate(...args) {
    const { image, callback } = handleArguments(...args);

    if (!image) {
      throw new Error('Detection subject not supported');
    }

    return callCallback(this.generateInternal(image), callback);
  }

  /**
   * @private
   * TODO: accept tensor3D
   * @param {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} src
   * @return {Promise<CartoonResult>}
   */
  async generateInternal(src) {
    await this.ready;
    await tf.nextFrame();
    const result = tf.tidy(() => {
      // adds resizeBilinear to resize image to 256x256 as required by the model
      let img = tf.browser.fromPixels(src).resizeBilinear([IMAGE_SIZE, IMAGE_SIZE]);
      if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
        throw new Error(`Input size should be ${IMAGE_SIZE}*${IMAGE_SIZE} but ${img.shape} is found`);
      } else if (img.shape[2] !== 3) {
        throw new Error(`Input color channel number should be 3 but ${img.shape[2]} is found`);
      }
      img = img.sub(127.5).div(127.5).reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);

      const alpha = tf.ones([IMAGE_SIZE, IMAGE_SIZE, 1]).tile([1, 1, 1]).mul(255)
      let res = this.model.predict(img);
      res = res.add(1).mul(127.5).reshape([IMAGE_SIZE, IMAGE_SIZE, 3]).floor();
      return res.concat(alpha, 2).cast('int32');
    })
    return generatedImageResult(result, this.config);
  }

}

/**
 * Accepts arguments:
 *  - The url path to your model. // TODO: accept the name of a pre-included model ('hosoda' or 'miyazaki')
 *  - An object of options with properties modelUrl and returnTensors.
 *  - A callback function to call when the model is loaded.
 *
 * Will use model `miyazaki` as the default model.
 *
 * @param {(string | CartoonOptions | ML5Callback<Cartoon>)[]} args
 * @return {Cartoon}
 */
const cartoon = (...args) => {
  const { options = {}, string, callback } = handleArguments(...args)

  if (string) {
    options.modelUrl = string;
  }

  return new Cartoon(options, callback);
};


export default cartoon; 
