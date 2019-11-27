import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';


class NeuralNetwork {

  constructor(_options) {
    const options = _options || {};
    // config
    this.config = options;

    this.isTrained = false;
    this.isCompiled = false;
    this.isLayered = false;

    this.model = null;

    this.init();
  }

  init(){
    this.createModel();
  }

  // eslint-disable-next-line class-methods-use-this
  createModel(_type = 'sequential') {
    switch (_type.toLowerCase()) {
      case 'sequential':
        this.model = tf.sequential();
        return this.model;
      default:
        this.model = tf.sequential();
        return this.model;
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

    // check if it has at least an input and output layer
    if(this.model.layers.length >=2){
      this.isLayered = true;
    }
    
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
    this.model.compile(_modelOptions);
    this.isCompiled = true;
  }

  /**
   * 
   * @param {*} learningRate 
   * @param {*} optimizer 
   */
  setOptimizerFunction(learningRate, optimizer) {
    return optimizer.call(this, learningRate);
  }

  /**
   * train(_options, _cb){ 
   * @param {*} _options 
   * @param {*} _cb 
   */
  train(_options, _cb) {
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

    const {
      batchSize,
      epochs,
      shuffle,
      validationSplit,
      whileTraining
    } = TRAINING_OPTIONS;

    await this.model.fit(xs, ys, {
      batchSize,
      epochs,
      shuffle,
      validationSplit,
      callbacks: [{
        onEpochEnd: whileTraining
      }]
    })

    xs.dispose();
    ys.dispose();

    this.isTrained = true;
  }

  /**
   * predict
   * @param {*} _inputs 
   * @param {*} _cb 
   */
  predict(_inputs, _meta = null, _cb) {
    return callCallback(this.predictInternal(_inputs, _meta), _cb);
  }


  /**
   * predictMultiple
   * @param {*} _inputs 
   * @param {*} _cb 
   */
  predictMultiple(_inputs, _cb) {
    return callCallback(this.predictMultipleInternal(_inputs), _cb);
  }

  /**
   * classify
   * @param {*} _inputs 
   * @param {*} _cb 
   */
  classify(_inputs, _meta = null, _cb) {
    return callCallback(this.classifyInternal(_inputs, _meta), _cb);
  }

  /**
   * classifyMultiple
   * @param {*} _inputs 
   * @param {*} _cb 
   */
  classifyMultiple(_inputs, _cb) {
    this.predictMultiple(_inputs, _cb);
  }

  async classifyInternal(_inputs, _meta) {

    const output = tf.tidy(() => {
      return this.model.predict(_inputs);
    })
    const result = await output.array();

    if (_meta !== null) {
      const label = Object.keys(_meta.outputs)[0]
      const vals = Object.entries(_meta.outputs[label].legend);

      const results = vals.map((item, idx) => {
        return {
          [label]: item[0],
          label: item[0],
          confidence: result[0][idx]
        };
      })

      return results;
    }

    output.dispose();
    _inputs.dispose();

    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  async predictInternal(_inputs, _meta) {
    const output = tf.tidy(() => {
      return this.model.predict(_inputs);
    })
    const result = await output.array();

    if (_meta !== null) {
      const labels = Object.keys(_meta.outputs);
      const results = labels.map((item, idx) => {
        return {
          label: item,
          value: result[0][idx]
        };
      })

      return results;
    }

    output.dispose();
    _inputs.dispose();

    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  async predictMultipleInternal(_inputs) {
    const output = tf.tidy(() => {
      return this.model.predict(_inputs);
    })
    const result = await output.array();
    output.dispose();
    _inputs.dispose();
    return result;
  }


  // eslint-disable-next-line class-methods-use-this
  save() {

  }

  // eslint-disable-next-line class-methods-use-this
  load() {

  }


}
export default NeuralNetwork;