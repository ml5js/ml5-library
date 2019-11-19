import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';



// eslint-disable-next-line no-unused-vars
const CLASSIFICATION_DEFAULTS = {
  learningRate: 0.2,
  modelLoss: 'categoricalCrossentropy',
  modelOptimizer: null, // tf.train.sgd(DEFAULT_LEARNING_RATE),
  metrics: ['accuracy']

}

// eslint-disable-next-line no-unused-vars
const REGRESSION_DEFAULTS = {
  learningRate: 0.2,
  modelLoss: 'meanSquaredError',
  modelOptimizer: null, // tf.train.adam(DEFAULT_LEARNING_RATE),
  metrics: ['accuracy']
}


class NeuralNetwork {

  constructor(_options) {
    const options = _options || {};
    // config
    this.config = {
      task: options.task || 'regression',
      returnTensors: options.returnTensors || false,
      architecture: {
        layers: options.layers || [],
        inputUnits: options.inputUnits || 2,
        outputUnits: options.outputUnits || 1,
        hiddenUnits: options.hiddenUnits || 16
      },
      modelOptions: {
        learningRate: options.learningRate || 0.25,
        modelLoss: options.modelLoss || null,
        modelOptimizer: options.modelOptimizer || null,
        metrics: options.metrics || ['accuracy'],

      },
      trainingOptions: {
        batchSize: options.batchSize || 32,
        epochs: options.epochs || 16
      }
    };

    this.setModelOptions(options.task);
    this.isTrained = false;
    this.model = tf.sequential();

  }


  setModelOptions(_task) {
    switch (_task) {
      case 'classification':
        this.config.modelOptions = {
          ...CLASSIFICATION_DEFAULTS
        };
        this.config.modelOptions.modelOptimizer = tf.train.sgd(CLASSIFICATION_DEFAULTS.learningRate);
        break;
      case 'regression':
        this.config.modelOptions = {
          ...REGRESSION_DEFAULTS
        };
        this.config.modelOptions.modelOptimizer = tf.train.adam(REGRESSION_DEFAULTS.learningRate);
        break;
      default:
        this.config.modelOptions = {
          ...CLASSIFICATION_DEFAULTS
        };
        this.config.modelOptions.modelOptimizer = tf.train.sgd(CLASSIFICATION_DEFAULTS.learningRate);
        break;
    }

  }

  // initialize parameters based on task
  /**
   * 
   */
  // eslint-disable-next-line class-methods-use-this
  init() {



  }

  /**
   * {inputShape: [1], units: 1, useBias: true}  
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


  /**
   * train
   * @param {*} optionsOrCallback 
   * @param {*} optionsOrWhileTraining 
   * @param {*} callback 
   */
  train(optionsOrCallback, optionsOrWhileTraining, callback) {
    const {
      options,
      whileTrainingCb,
      finishedTrainingCb
    } = NeuralNetwork.checkTrainingArgs(optionsOrCallback, optionsOrWhileTraining, callback);
    return callCallback(this.trainInternal(options, whileTrainingCb), finishedTrainingCb);
  }

  /**
   * trainInternal
   * @param {*} _options 
   * @param {*} _whileTrainingCallback 
   */
  async trainInternal(_options, _whileTrainingCallback) {

    // xs, ys will be tensors 
    // get them from the options
    // or from the DiyNeuralNework.data
    let xs;
    let ys;
    let whileTraining;

    if (typeof whileTrainingCallback === 'function') {
      whileTraining = _whileTrainingCallback;
    } else {
      whileTraining = () => null;
    }

    const modelFitCallbacks = [{
      onEpochEnd: whileTraining
    }]

    // train the model
    const TRAINING_OPTIONS = {
      shuffle: true,
      batchSize: _options.batchSize || 36,
      epochs: _options.epochs || 10,
      validationSplit: _options.validationSplit || 0.1,
      callbacks: modelFitCallbacks
    }


    // check the inputs
    if ((_options.inputs && _options.outputs) &&
      !(_options.inputs instanceof tf.Tensor) &&
      !(_options.outputs instanceof tf.Tensor)) {
      xs = tf.tensor(_options.inputs);
      ys = tf.tensor(_options.outputs);
    } else if ((_options.inputs && _options.outputs)) {
      xs = _options.inputs;
      ys = _options.outputs;
    } else {
      // TODO: replace this with data from the NeuralNetworkData
      xs = _options.inputs;
      ys = _options.outputs;
    }

    // compile the model
    this.compile(this.config.modelOptions);

    // train the model
    await this.model.fit(xs, ys, TRAINING_OPTIONS);

    // set isTrained to true
    this.isTrained = true;
    // dispose tensors
    xs.dispose();
    ys.dispose();
  }

  /**
   * Check the arguments for the training
   * @param {*} optionsOrCallback 
   * @param {*} optionsOrWhileTraining 
   * @param {*} callback 
   */
  static checkTrainingArgs(optionsOrCallback, optionsOrWhileTraining, callback) {
    let options;
    let whileTrainingCb;
    let finishedTrainingCb;
    if (typeof optionsOrCallback === 'object' &&
      typeof optionsOrWhileTraining === 'function' &&
      typeof callback === 'function'
    ) {
      options = optionsOrCallback;
      whileTrainingCb = optionsOrWhileTraining;
      finishedTrainingCb = callback;
    } else if (typeof optionsOrCallback === 'object' &&
      typeof optionsOrWhileTraining === 'function') {
      options = optionsOrCallback;
      whileTrainingCb = null;
      finishedTrainingCb = optionsOrWhileTraining;
    } else if (typeof optionsOrCallback === 'function' &&
      typeof optionsOrWhileTraining === 'function'
    ) {
      options = {};
      whileTrainingCb = optionsOrCallback;
      finishedTrainingCb = optionsOrWhileTraining;
    } else {
      options = {};
      whileTrainingCb = null;
      finishedTrainingCb = optionsOrCallback;
    }
    return {
      options,
      whileTrainingCb,
      finishedTrainingCb
    }
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