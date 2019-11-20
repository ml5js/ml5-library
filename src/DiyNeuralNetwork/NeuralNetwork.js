import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';

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
    const MODEL_OPTIONS = _modelOptions;
    console.log(MODEL_OPTIONS)
    this.model.compile(MODEL_OPTIONS);
  }

  /**
   * train(_options, _cb){ 
   * @param {*} _options 
   * @param {*} _cb 
   */
  train(_options, _cb){
    return callCallback(this.trainInternal(_options), _cb);
  }

  /**
   * trainInternal
   * @param {*} _options 
   */
  async trainInternal(_options) {
    const TRAINING_OPTIONS = _options;
    const xs = TRAINING_OPTIONS.inputs;
    const ys = TRAINING_OPTIONS.outputs;
    const {batchSize, epochs, shuffle, whileTraining} = TRAINING_OPTIONS;

    await this.model.fit(xs, ys, {
      batchSize, 
      epochs, 
      shuffle,
      callbacks: [
        {
          onEpochEnd: whileTraining
        }
      ]
    })
  }

  // eslint-disable-next-line class-methods-use-this
  predict(_inputs) {
    return tf.tidy( () => {
      const output = this.model.predict(_inputs);
      return output.arraySync();
    })
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