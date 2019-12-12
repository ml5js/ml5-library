import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
import { saveBlob } from '../utils/io';

class NeuralNetwork {
  constructor() {
    // flags
    this.isTrained = false;
    this.isCompiled = false;
    this.isLayered = false;
    // the model
    this.model = null;

    // methods
    this.init = this.init.bind(this);
    this.createModel = this.createModel.bind(this);
    this.addLayer = this.addLayer.bind(this);
    this.compile = this.compile.bind(this);
    this.setOptimizerFunction = this.setOptimizerFunction.bind(this);
    this.train = this.train.bind(this);
    this.trainInternal = this.trainInternal.bind(this);
    this.predict = this.predict.bind(this);
    this.classify = this.classify.bind(this);
    this.save = this.save.bind(this);
    this.load = this.load.bind(this);

    // initialize
    this.init();
  }

  /**
   * initialize with create model
   */
  init() {
    this.createModel();
  }

  /**
   * creates a sequential model
   * uses switch/case for potential future where different formats are supported
   * @param {*} _type
   */
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
   * add layer to the model
   * if the model has 2 or more layers switch the isLayered flag
   * @param {*} _layerOptions
   */
  addLayer(_layerOptions) {
    const LAYER_OPTIONS = _layerOptions || {};
    this.model.add(LAYER_OPTIONS);

    // check if it has at least an input and output layer
    if (this.model.layers.length >= 2) {
      this.isLayered = true;
    }
  }

  /**
   * Compile the model
   * if the model is compiled, set the isCompiled flag to true
   * @param {*} _modelOptions
   */
  compile(_modelOptions) {
    this.model.compile(_modelOptions);
    this.isCompiled = true;
  }

  /**
   * Set the optimizer function given the learning rate
   * as a paramter
   * @param {*} learningRate
   * @param {*} optimizer
   */
  setOptimizerFunction(learningRate, optimizer) {
    return optimizer.call(this, learningRate);
  }

  /**
   * Calls the trainInternal() and calls the callback when finished
   * @param {*} _options
   * @param {*} _cb
   */
  train(_options, _cb) {
    return callCallback(this.trainInternal(_options), _cb);
  }

  /**
   * Train the model
   * @param {*} _options
   */
  async trainInternal(_options) {
    const TRAINING_OPTIONS = _options;

    const xs = TRAINING_OPTIONS.inputs;
    const ys = TRAINING_OPTIONS.outputs;

    const { batchSize, epochs, shuffle, validationSplit, whileTraining } = TRAINING_OPTIONS;

    await this.model.fit(xs, ys, {
      batchSize,
      epochs,
      shuffle,
      validationSplit,
      callbacks: whileTraining,
    });

    xs.dispose();
    ys.dispose();

    this.isTrained = true;
  }

  /**
   * returns the prediction as an array
   * @param {*} _inputs
   */
  async predict(_inputs) {
    const output = tf.tidy(() => {
      return this.model.predict(_inputs);
    });
    const result = await output.array();

    output.dispose();
    _inputs.dispose();

    return result;
  }

  /**
   * classify is the same as .predict()
   * @param {*} _inputs
   */
  async classify(_inputs) {
    return this.predict(_inputs);
  }

  // predictMultiple
  // classifyMultiple
  // are the same as .predict()

  /**
   * save the model
   * @param {*} nameOrCb
   * @param {*} cb
   */
  async save(nameOrCb, cb) {
    let modelName;
    let callback;

    if (typeof nameOrCb === 'function') {
      modelName = 'model';
      callback = nameOrCb;
    } else if (typeof nameOrCb === 'string') {
      modelName = nameOrCb;

      if (typeof cb === 'function') {
        callback = cb;
      }
    } else {
      modelName = 'model';
    }

    this.model.save(
      tf.io.withSaveHandler(async data => {
        this.weightsManifest = {
          modelTopology: data.modelTopology,
          weightsManifest: [
            {
              paths: [`./${modelName}.weights.bin`],
              weights: data.weightSpecs,
            },
          ],
        };

        await saveBlob(data.weightData, `${modelName}.weights.bin`, 'application/octet-stream');
        await saveBlob(JSON.stringify(this.weightsManifest), `${modelName}.json`, 'text/plain');
        if (callback) {
          callback();
        }
      }),
    );
  }

  /**
   * loads the model and weights
   * @param {*} filesOrPath
   * @param {*} callback
   */
  async load(filesOrPath = null, callback) {
    if (filesOrPath instanceof FileList) {
      const files = await Promise.all(
        Array.from(filesOrPath).map(async file => {
          if (file.name.includes('.json') && !file.name.includes('_meta')) {
            return { name: 'model', file };
          } else if (file.name.includes('.json') && file.name.includes('_meta.json')) {
            const modelMetadata = await file.text();
            return { name: 'metadata', file: modelMetadata };
          } else if (file.name.includes('.bin')) {
            return { name: 'weights', file };
          }
          return { name: null, file: null };
        }),
      );

      const model = files.find(item => item.name === 'model').file;
      const weights = files.find(item => item.name === 'weights').file;

      // load the model
      this.model = await tf.loadLayersModel(tf.io.browserFiles([model, weights]));
    } else if (filesOrPath instanceof Object) {
      // filesOrPath = {model: URL, metadata: URL, weights: URL}

      let modelJson = await fetch(filesOrPath.model);
      modelJson = await modelJson.text();
      const modelJsonFile = new File([modelJson], 'model.json', { type: 'application/json' });

      let weightsBlob = await fetch(filesOrPath.weights);
      weightsBlob = await weightsBlob.blob();
      const weightsBlobFile = new File([weightsBlob], 'model.weights.bin', {
        type: 'application/macbinary',
      });

      this.model = await tf.loadLayersModel(tf.io.browserFiles([modelJsonFile, weightsBlobFile]));
    } else {
      this.model = await tf.loadLayersModel(filesOrPath);
    }

    this.isCompiled = true;
    this.isLayered = true;
    this.isTrained = true;

    if (callback) {
      callback();
    }
    return this.model;
  }
}
export default NeuralNetwork;
