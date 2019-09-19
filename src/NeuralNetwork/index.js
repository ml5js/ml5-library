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
// import { input } from '@tensorflow/tfjs';


const DEFAULTS = {
  task: 'regression',
  activationHidden: 'sigmoid',
  activationOutput: 'sigmoid',
  debug: true,
  learningRate: 0.25,
  inputs: 2,
  outputs: 1,
  noVal: null,
  hiddenUnits: 1,
  modelMetrics: ['accuracy'],
  modelLoss: 'meanSquaredError',
  modelOptimizer: null,
  batchSize: 64,
  epochs: 32,
}


class NeuralNetworkData {
  constructor(options) {
    this.task = options.task || DEFAULTS.task;
    this.inputs = options.inputs || DEFAULTS.inputs;
    this.outputs = options.outputs || DEFAULTS.outputs;
    // this.noVal = options.noVal || DEFAULTS.noVal;

    this.meta = {
      inputUnits: null,
      outputUnits: null,
      inputTypes: [],
      outputTypes: [],
    }

    this.data = null;
    this.xs = [];
    this.ys = [];
    this.tensor = null;
    this.normalizedData = {
      inputs: null,
      targets: null,
      inputMax: null,
      inputMin: null,
      targetMax: null,
      targetMin: null,
    }

  }

  /* eslint class-methods-use-this: ["error", { "exceptMethods": ["shuffle"] }] */
  shuffle() {
    if (this.data === null) {
      this.data = [...new Array(this.xs.length).fill(null).map((item, idx) => ({
        xs: this.xs[idx],
        ys: this.ys[idx]
      }))]
    }
    tf.util.shuffle(this.data);
  }

  normalize() {
    if (this.data === null) {
      this.data = [...new Array(this.xs.length).fill(null).map((item, idx) => ({
        xs: this.xs[idx],
        ys: this.ys[idx]
      }))]
    }
    const outputLabel = this.outputs[0];
    const inputLabels = this.inputs;

    // !!!! TODO: need to test this for regression data. !!!!!

    // Step 2. Convert data to Tensor
    const inputs = inputLabels.map(header => this.data.map(d => d.xs[header]))
    const targets = this.data.map(d => d.ys[outputLabel]);

    const uniqueTargets = [...new Set(targets)]
    const oneHotTargets = targets.map(target => uniqueTargets.indexOf(target));
    console.log(oneHotTargets)

    const inputTensor = tf.tensor(inputs);


    let outputTensor;
    if (this.task === 'classification') {
      outputTensor = tf.oneHot(tf.tensor1d(oneHotTargets, 'int32'), this.meta.outputUnits);
    } else {
      outputTensor = tf.tensor(targets);
    }


    // // Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();
    const targetMax = outputTensor.max();
    const targetMin = outputTensor.min();

    const normalizedInputs = inputTensor.sub(targetMin).div(targetMax.sub(inputMin)).flatten().reshape([this.data.length, this.meta.inputUnits]);

    // console.log()
    const normalizedOutputs = outputTensor.sub(targetMin).div(targetMax.sub(targetMin));

    inputTensor.max(1).print();

    this.normalizedData = {
      inputs: normalizedInputs, // normalizedInputs,
      targets: normalizedOutputs,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      targetMax,
      targetMin,
    }
    // });
  }

  addData(xs, ys) {
    this.xs.push(xs);
    this.ys.push(ys);
  }

}

class NeuralNetwork {
  /**
   * Create a Neural Network.
   * @param {object} options - An object with options.
   */
  constructor(options, callback) {
    // TODO: create the model based on many more options and defaults

    this.config = {
      dataUrl: options.dataUrl || null,
      task: options.task || DEFAULTS.task,
      debug: options.debug || DEFAULTS.debug,
      activationHidden: options.activationHidden || DEFAULTS.activationHidden,
      activationOutput: options.activationOutput || DEFAULTS.activationOutput,
      inputs: options.inputs || DEFAULTS.inputs,
      outputs: options.outputs || DEFAULTS.outputs,
      noVal: options.noVal || options.outputs,
      hiddenUnits: options.hiddenUnits || DEFAULTS.hiddenUnits,
      learningRate: options.outputs || DEFAULTS.learningRate,
      modelMetrics: options.modelMetrics || DEFAULTS.modelMetrics,
      modelLoss: options.modelLoss || DEFAULTS.modelLoss,
      modelOptimizer: options.modelOptimizer || DEFAULTS.modelOptimizer,
      batchSize: options.batchSize || DEFAULTS.batchSize,
      epochs: options.epochs || DEFAULTS.epochs,
    }

    this.data = new NeuralNetworkData(options);

    // TODO: before the model is created, load any relevant data / run the getIOUnits() function 
    // to get back the number of units
    if (this.config.dataUrl !== null) {
      this.ready = this.createModelFromData(callback);
    } else {
      // set the inputUnits and outputUnits
      this.data.meta.inputUnits = this.config.inputs;
      this.data.meta.outputUnits = this.config.outputs;
      // create the model
      this.model = this.createModel();
    }

  }

  createModelFromData(callback) {
    return callCallback(this.createModelFromDataInternal(), callback)
  }

  async createModelFromDataInternal() {
    // load the data
    await this.loadData();
    // check the input columns for data type to
    // calculate the total number of inputs
    // and outputs
    this.getIOUnits();

    console.log('making classification model')

    this.model = this.createModel();
  }

  /**
   * Gets the total number of inputs/outputs based on the data type 
   * Uses the relevant function to convert values e.g. oneHot() and 
   * sends back the appropriate length of values
   * @param {*} val 
   */
  getIOUnits() {
    let inputUnits = 0;
    let outputUnits = 0;


    this.data.meta.inputTypes.forEach((item) => {
      if (item.dtype === 'number') {
        inputUnits += 1;
      } else if (item.dtype === 'string') {
        const uniqueVals = [...new Set(this.data.xs.map(obj => obj[item.name]))]
        inputUnits += uniqueVals.length;
      }
    });

    this.data.meta.outputTypes.forEach((item) => {
      if (item.dtype === 'number') {
        outputUnits += 1;
      } else if (item.dtype === 'string') {
        const uniqueVals = [...new Set(this.data.ys.map(obj => obj[item.name]))]
        outputUnits += uniqueVals.length;
      }
    });

    console.log(inputUnits, outputUnits)

    this.data.meta.inputUnits = inputUnits;
    this.data.meta.outputUnits = outputUnits;

  }


  async loadData() {
    const outputLabel = this.config.outputs[0];
    const inputLabels = this.config.inputs;

    const inputConfig = {};
    inputLabels.forEach(label => {
      inputConfig[label] = {
        isLabel: false
      }
    });

    this.data.tensor = tf.data.csv(this.config.dataUrl, {
      columnConfigs: {
        ...inputConfig,
        [outputLabel]: {
          isLabel: true
        }
      },
      configuredColumnsOnly: true
    });

    const data = await this.data.tensor.toArray();
    // TODO: not sure if this makes sense...
    this.data.data = data;

    data.forEach(item => {
      this.data.xs.push(item.xs);
      this.data.ys.push(item.ys);
    });

    // TODO: check for int32, float32, bool, or string
    this.data.meta.inputTypes = Object.keys(data[0].xs).map(prop => ({
      name: prop,
      dtype: typeof data[0].xs[prop]
    }))
    this.data.meta.outputTypes = Object.keys(data[0].ys).map(prop => ({
      name: prop,
      dtype: typeof data[0].ys[prop]
    }))

    // console.log(this.data.meta)

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
      inputShape: [this.data.meta.inputUnits],
      activation: this.config.activationHidden,
    });

    // TODO: figure out if we want to add in the ability to add more layers?

    const output = tf.layers.dense({
      units: this.data.meta.outputUnits,
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

  train(callback) {
    return callCallback(this.trainInternal(), callback);
  }

  async trainInternal() {
    const {
      batchSize,
      epochs
    } = this.config;

    let xs;
    let ys;
    const {
      inputs,
      targets
    } = this.data.normalizedData;

    // check if the inputs are tensors, if not, convert!
    if (!(inputs instanceof tf.Tensor)) {
      xs = tf.tensor(inputs)
      ys = tf.tensor(targets)
    } else {
      xs = inputs;
      ys = targets;
    }

    let modelFitCallbacks;
    if (this.config.debug) {
      modelFitCallbacks = [tfvis.show.fitCallbacks({
            name: 'Training Performance'
          },
          ['loss', 'accuracy'], {
            height: 200,
            callbacks: ['onEpochEnd']
          }
        ),
        {
          onEpochEnd: (epoch, logs) => console.log(`Epoch: ${epoch} - accuracy: ${logs.loss.toFixed(3)}`)
        },
        {
          onTrainEnd: () => console.log(`training complete!`)
        },
      ]
    } else {
      modelFitCallbacks = []
    }

    await this.model.fit(xs, ys, {
      shuffle: true,
      batchSize,
      epochs,
      validationSplit: 0.1,
      callbacks: modelFitCallbacks
    });
    xs.dispose();
    ys.dispose();
  }



  predict(input, callback) {
    return callCallback(this.predictInternal(input), callback);
  }


  async predictInternal(sample) {
    const xs = tf.tensor(sample, [1, sample.length]);
    const ys = this.model.predict(xs);

    const results = {
      output: await ys.data(),
      tensor: ys
    }
    xs.dispose();

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



const neuralNetwork = (inputsOrOptions, outputsOrCallback, callback) => {

  let options;
  let cb;

  if (inputsOrOptions instanceof Object) {
    options = inputsOrOptions;
    cb = outputsOrCallback;
  } else {
    options = {
      input: inputsOrOptions,
      outputs: outputsOrCallback,
    };
    cb = callback;
  }

  const instance = new NeuralNetwork(options, cb);
  return instance;
};

export default neuralNetwork;



// /**
//  * Loads in CSV data by URL
//  * @param {*} options or DATAURL
//  * @param {*} callback
//  */
// loadData(optionsOrDataUrl, callback) {
//   let options;
//   if (typeof optionsOrDataUrl === 'string') {
//     options = {
//       dataUrl: optionsOrDataUrl
//     }
//   } else {
//     options = optionsOrDataUrl;
//   }
//   return callCallback(this.loadDataInternal(options), callback);
// }

// // TODO: need to add loading in for JSON data
// /**
//  * Loads in a CSV file
//  * @param {*} options
//  */
// async loadDataInternal(options) {

//   this.config.inputKeys = options.inputKeys || [...new Array(this.inputUnits).fill(null).map((v, idx) => idx)];
//   this.config.outputKeys = options.outputKeys || [...new Array(this.outputUnits / 2).fill(null).map((v, idx) => idx)];

//   const outputLabel = this.config.outputKeys[0];
//   const inputLabels = this.config.inputKeys;

//   let data = tf.data.csv(options.dataUrl, {
//     columnConfigs: {
//       [outputLabel]: {
//         isLabel: true
//       }
//     }
//   });

//   data = await data.toArray();

//   if (this.config.debug) {
//     const values = inputLabels.map(label => {
//       return data.map(item => {
//         return {
//           x: item.xs[label],
//           y: item.ys[outputLabel]
//         }
//       })
//     })

//     tfvis.render.scatterplot({
//       name: 'debug mode'
//     }, {
//       values
//     }, {
//       xLabel: 'X',
//       yLabel: 'Y',
//       height: 300
//     });
//   }

//   return data;
// }

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["shuffle"] }] */
// shuffle(data) {
//   tf.util.shuffle(data);
// }


// normalize(data) {
//   return tf.tidy(() => {
//     const outputLabel = this.config.outputKeys[0];
//     const inputLabels = this.config.inputKeys;

//     // TODO: need to test this for regression data.

//     // Step 2. Convert data to Tensor
//     // const inputs = data.map(d => inputLabels.map(header => d.xs[header]));
//     const inputs = inputLabels.map(header => data.map(d => d.xs[header]))
//     const targets = data.map(d => d.ys[outputLabel]);

//     const inputTensor = tf.tensor(inputs);

//     let outputTensor;
//     if (this.config.task === 'classification') {
//       outputTensor = tf.oneHot(tf.tensor1d(targets, 'int32'), this.config.noVal);
//     } else {
//       outputTensor = tf.tensor(targets);
//     }


//     // // Step 3. Normalize the data to the range 0 - 1 using min-max scaling
//     const inputMax = inputTensor.max();
//     const inputMin = inputTensor.min();
//     const targetMax = outputTensor.max();
//     const targetMin = outputTensor.min();

//     const normalizedInputs = inputTensor.sub(targetMin).div(targetMax.sub(inputMin)).flatten().reshape([data.length, this.config.inputUnits]);

//     // console.log()
//     const normalizedOutputs = outputTensor.sub(targetMin).div(targetMax.sub(targetMin));

//     inputTensor.max(1).print();

//     return {
//       inputs: normalizedInputs, // normalizedInputs,
//       targets: normalizedOutputs,
//       // Return the min/max bounds so we can use them later.
//       inputMax,
//       inputMin,
//       targetMax,
//       targetMin,
//     }
//   });
// }