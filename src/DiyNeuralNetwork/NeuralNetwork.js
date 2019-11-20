import * as tf from '@tensorflow/tfjs';
// import callCallback from '../utils/callcallback';

class NeuralNetwork {

  constructor(_options) {
    const options = _options || {};
    // config
    this.config = options;
    this.isTrained = false;
    this.model = null;

  }

  // eslint-disable-next-line class-methods-use-this
  createModel(_type='sequential') {
    switch (_type.toLowerCase()) {
      case 'sequential':
        this.model = tf.sequential();
        break;
      default:
        this.model = tf.sequential();
        break;
    }
  }

  /**
   * {inputShape: [1], units: 1, useBias: true}  
   * basic:
    * tf.layers.dense (input)
    * tf.layers.dense (output)
   * convolutional nn: 
    * tf.layers.conv2d, tf.layers.maxPooling2d, 
    * tf.layers.maxPooling2d, tf.layers.flatten(),
    * tf.layers.dense
   * @param {*} _layerOptions 
   */
  addLayer(_layerOptions) {
    const LAYER_OPTIONS = _layerOptions || {};
    this.model.add(LAYER_OPTIONS);
  }

  /**
   * {
   *    optimizer: tf.train.adam(),
   *    loss: tf.losses.meanSquaredError,
   *    metrics: ['mse'],
   *  } 
   * @param {*} _trainingOptions 
   */
  compile(_modelOptions) {
    const MODEL_OPTIONS = _modelOptions || this.config.modelOptions;
    this.model.compile(MODEL_OPTIONS);
  }

  // eslint-disable-next-line class-methods-use-this
  train() {

  }

  // eslint-disable-next-line class-methods-use-this
  predict() {

  }

  // eslint-disable-next-line class-methods-use-this
  predictMultiple() {

  }

  // eslint-disable-next-line class-methods-use-this
  classify() {

  }

  // eslint-disable-next-line class-methods-use-this
  classifyMultiple() {

  }

  // eslint-disable-next-line class-methods-use-this
  save() {

  }

  // eslint-disable-next-line class-methods-use-this
  load() {

  }


}
export default NeuralNetwork;