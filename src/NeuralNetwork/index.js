// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Generic NeuralNetwork class
*/

import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import callCallback from '../utils/callcallback';
import {
  saveBlob
} from '../utils/io';


const DEFAULTS = {
  task: 'regression',
  // activation: 'sigmoid',
  activationHidden: 'sigmoid',
  activationOutput: 'sigmoid',
  debug: true,
  learningRate: 0.25,
  inputUnits: 2,
  outputUnits: 1,
  noVal: null,
  hiddenUnits: 1,
  modelMetrics: ['accuracy'],
  modelLoss: 'meanSquaredError',
  modelOptimizer: null,
  batchSize: 64,
  epochs: 32,
  inputKeys: [],
  outputKeys: []
}

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options) {
    // TODO: create the model based on many more options and defaults

    this.config = {
      task: options.task || DEFAULTS.task,
      debug: options.debug || DEFAULTS.debug,
      // activation: options.activation || DEFAULTS.activation,
      activationHidden: options.activationHidden || DEFAULTS.activationHidden,
      activationOutput: options.activationOutput || DEFAULTS.activationOutput,
      inputUnits: options.inputs || DEFAULTS.inputUnits,
      outputUnits: options.outputs || DEFAULTS.outputUnits,
      noVal: options.noVal || options.outputs,
      hiddenUnits: options.hiddenUnits || DEFAULTS.hiddenUnits,
      learningRate: options.outputs || DEFAULTS.learningRate,
      modelMetrics: options.modelMetrics || DEFAULTS.modelMetrics,
      modelLoss: options.modelLoss || DEFAULTS.modelLoss,
      modelOptimizer: options.modelOptimizer || DEFAULTS.modelOptimizer,
      batchSize: options.batchSize || DEFAULTS.batchSize,
      epochs: options.epochs || DEFAULTS.epochs,
      inputKeys: options.inputKeys || [...new Array(options.inputs).fill(null).map((v, idx) => idx)],
      outputKeys: options.outputKeys || [...new Array(options.outputs / 2).fill(null).map((v, idx) => idx)]
    }

    this.model = this.createModel();
    this.training = {
      _xs: [],
      _ys: []
    }

    // this.training_xs = [];
    // this.training_ys = [];
  }

  /**
   * createModel()
   * Depending on the task -- classification or regression -- returns a simple model architecture
   */
  createModel() {

    switch (this.config.task) {
      case 'regression':
        this.config.modelOptimizer = tf.train.sgd(this.config.learningRate);
        return this.createModelInternal();
      case 'classification':

        // Change the default activations for classifications
        this.config.hiddenUnits = 16;
        this.config.activationHidden = 'relu' // 'relu',
        this.config.activationOutput = 'softmax' // 'relu',
        this.config.modelLoss = 'categoricalCrossentropy'
        this.config.modelOptimizer = tf.train.adam();

        return this.createModelInternal();
      default:
        console.log('no model exists for this type of task yet!');
        return tf.sequential();
    }
  }

  /**
   * createModelInternal()
   * Creates a sequential model with 1 hidden layer, and 1 output layer
   */
  createModelInternal() {
    const model = tf.sequential();

    const hidden = tf.layers.dense({
      units: this.config.hiddenUnits,
      inputShape: [this.config.inputUnits],
      activation: this.config.activationHidden,
    });

    // TODO: figure out if we want to add in the ability to add more layers?

    const output = tf.layers.dense({
      units: this.config.outputUnits,
      activation: this.config.activationOutput,
    });

    model.add(hidden);
    model.add(output);

    model.compile({
      optimizer: this.config.modelOptimizer,
      loss: this.config.modelLoss,
      metrics: this.config.modelMetrics,
    });

    if (this.config.debug) {
      tfvis.show.modelSummary({
        name: 'Model Summary'
      }, model);
    }

    return model;
  }


  /**
   * Loads in CSV data by URL
   * @param {*} DATA_URL
   * @param {*} callback
   */
  loadData(DATA_URL, callback) {
    return callCallback(this.loadDataInternal(DATA_URL), callback);
  }

  // TODO: need to add loading in for JSON data
  /**
   * Loads in a CSV file
   * @param {*} DATA_URL
   */
  async loadDataInternal(DATA_URL) {
    const outputLabel = this.config.outputKeys[0];
    const inputLabels = this.config.inputKeys;
    console.log(inputLabels)

    let data = await tf.data.csv(DATA_URL, {
      columnConfigs: {
        [outputLabel]: {
          isLabel: true
        }
      }
    });

    data = await data.toArray();

    if (this.config.debug) {
      const values = inputLabels.map(label => {
        return data.map(item => {
          return {
            x: item.xs[label],
            y: item.ys[outputLabel]
          }
        })
      })

      tfvis.render.scatterplot({
        name: 'debug mode'
      }, {
        values
      }, {
        xLabel: 'X',
        yLabel: 'Y',
        height: 300
      });
    }

    return data;
  }


  normalize(data) {
    return tf.tidy(() => {
      const outputLabel = this.config.outputKeys[0];
      const inputLabels = this.config.inputKeys;
      // Step 1. Shuffle the data
      tf.util.shuffle(data);


      // TODO: need to test this for regression data.

      // Step 2. Convert data to Tensor
      // const inputs = data.map(d => inputLabels.map(header => d.xs[header]));
      const inputs = inputLabels.map(header => data.map(d => d.xs[header]))
      const labels = data.map(d => d.ys[outputLabel]);

      const inputTensor = tf.tensor(inputs);

      let outputTensor;
      console.log(this.config.task)
      if (this.config.task === 'classification') {
        outputTensor = tf.oneHot(tf.tensor1d(labels, 'int32'), this.config.noVal);
      } else {
        outputTensor = tf.tensor(labels);
      }


      // // Step 3. Normalize the data to the range 0 - 1 using min-max scaling
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = outputTensor.max();
      const labelMin = outputTensor.min();

      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin)).flatten().reshape([data.length, this.config.inputUnits]);

      // console.log()
      const normalizedOutputs = outputTensor.sub(labelMin).div(labelMax.sub(labelMin));

      inputTensor.max(1).print();

      return {
        inputs: normalizedInputs, // normalizedInputs,
        labels: normalizedOutputs,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      }


    })

  }


  addData(xs, ys) {
    this.training.xs.push(xs);
    this.training.ys.push(ys);
  }

  train(inputs, labels, callback) {
    return callCallback(this.trainInternal(inputs, labels), callback);
  }

  async trainInternal(inputs, labels) {
    const { batchSize, epochs } = this.config;
    let xs;
    let ys;

    // check if the inputs are tensors, if not, convert!
    if (!(inputs instanceof tf.Tensor)) {
      xs = tf.tensor(inputs)
      ys = tf.tensor(labels)
    } else {
      xs = inputs;
      ys = labels;
    }

    await this.model.fit(xs, ys, {
      shuffle: true,
      batchSize,
      epochs,
      validationSplit: 0.1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch: ${epoch} - accuracy: ${logs.loss.toFixed(3)}`);
        },
        onTrainEnd: () => {
          console.log(`training complete!`);
        }
      },
    });
    xs.dispose();
    ys.dispose();
  }

  // async trainInternal1(optionsOrEpochs, callback) {
  //   let options;
  //   if (optionsOrEpochs instanceof Object) {
  //     options = optionsOrEpochs;
  //   } else {
  //     options = {
  //       epochs: optionsOrEpochs,
  //       shuffle: true,
  //       validationSplit: 0.1,
  //     };
  //   }

  //   const xs = tf.tensor2d(this.training.xs);
  //   const ys = tf.tensor2d(this.training.ys);
  //   await this.model.fit(xs, ys, {
  //     shuffle: options.shuffle,
  //     validationSplit: options.validationSplit,
  //     epochs: options.epochs,
  //     callbacks: {
  //       onEpochEnd: (epoch, logs) => {
  //         callback(null, {
  //           status: 'training',
  //           epoch,
  //           loss: logs.loss,
  //           logs
  //         });
  //       },
  //       onTrainEnd: () => {
  //         callback(null, {
  //           status: 'complete'
  //         });
  //       },
  //     },
  //   });
  //   xs.dispose();
  //   ys.dispose();
  // }

  predict(input, callback) {
    return callCallback(this.predictInternal(input), callback);
  }

  // async predictInternal(input) {
  //   const xs = tf.tensor2d([input]);
  //   const ys = this.model.predict(xs);
  //   const results = {
  //     output: await ys.data(),
  //     tensor: ys,
  //   };
  //   xs.dispose();
  //   return results;
  // }

  async  predictInternal(sample) {
    console.log(sample)
    const xs = tf.tensor(sample, [1, sample.length]);
    const ys = this.model.predict(xs);

    const results = {
      output: await ys.data(),
      tensor: ys
    }
    xs.dispose();


    // const maxValue = 0;
    // let output = this.config.NO_VAL;

    // for (let i = 0; i < this.config.inputUnits; i+=1) {
    //   if (result[0][i] > maxValue) {
    //     output = i;
    //   }
    // }

    // return output;

    return results;
  }

  async save(callback, name) {
    this.model.save(tf.io.withSaveHandler(async (data) => {
      let modelName = 'model';
      if (name) modelName = name;

      this.weightsManifest = {
        modelTopology: data.modelTopology,
        weightsManifest: [{
          paths: [`./${modelName}.weights.bin`],
          weights: data.weightSpecs,
        }]
      };
      await saveBlob(data.weightData, `${modelName}.weights.bin`, 'application/octet-stream');
      await saveBlob(JSON.stringify(this.weightsManifest), `${modelName}.json`, 'text/plain');
      if (callback) {
        callback();
      }
    }));
  }

  async load(filesOrPath = null, callback) {
    if (typeof filesOrPath !== 'string') {
      let model = null;
      let weights = null;
      Array.from(filesOrPath).forEach((file) => {
        if (file.name.includes('.json')) {
          model = file;
          const fr = new FileReader();
          fr.readAsText(file);
        } else if (file.name.includes('.bin')) {
          weights = file;
        }
      });
      this.model = await tf.loadLayersModel(tf.io.browserFiles([model, weights]));
    } else {
      fetch(filesOrPath)
        .then(r => r.json());
      this.model = await tf.loadLayersModel(filesOrPath);
    }
    if (callback) {
      callback();
    }
    return this.model;
  }
}

const neuralNetwork = (inputsOrOptions, outputs) => {
  let options;
  if (inputsOrOptions instanceof Object) {
    options = inputsOrOptions;
  } else {
    options = {
      input: inputsOrOptions,
      outputs,
    };
  }

  const instance = new NeuralNetwork(options);
  return instance;
};

export default neuralNetwork;