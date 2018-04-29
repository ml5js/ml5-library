// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
A LSTM Generator: Run inference mode for a pre-trained LSTM.
*/

import * as tf from '@tensorflow/tfjs';
// import sampleFromDistribution from './../utils/sample';

// const regexCell = /cell_[0-9]|lstm_[0-9]/gi;
// const regexWeights = /weights|weight|kernel|kernels|w/gi;
// const regexFullyConnected = /softmax/gi;

class LSTMGenerator {
  constructor(modelPath = './', callback = () => {}) {
    this.modelPath = modelPath;
    this.ready = false;
    this.indices_char = {};
    this.char_indices = {};
    this.defaults = {
      seed: 'a',
      inputLength: 40,
      length: 20,
      temperature: 0.5,
    };

    this.loaders = [
      this.loadFile('indices_char'),
      this.loadFile('char_indices'),
    ];

    tf.loadModel('model/model.json').then((model) => {
      this.model = model;
      console.log('model! loaded!', model);
      // this.enableGeneration();
    });

    console.log('here!!');
    // Promise
    //   .all(this.loaders)
    //   .then(() => tf.loadModel(`${this.modelPath}/model.json`))
    //   .then((model) => { this.model = model; })
    //   .then(() => callback());
  }

  loadFile(type) {
    fetch(`${this.modelPath}/${type}.json`)
      .then(response => response.json())
      .then((json) => { this[type] = json; })
      .catch(error => console.error(`Error when loading the model ${error}`));
  }

  // async generate(options, callback) {
  //   const seed = options.seed || this.defaults.seed;
  //   const length = +options.length || this.defaults.length;
  //   const temperature = +options.temperature || this.defaults.temperature;
  //   const results = [];

  //   if (this.ready) {
  //     const forgetBias = dl.tensor(1.0);
  //     const LSTMCells = [];
  //     let c = [];
  //     let h = [];

  //     const lstm = (i) => {
  //       const cell = (DATA, C, H) =>
  // dl.basicLSTMCell(forgetBias, this.model[`Kernel_${i}`], this.model[`Bias_${i}`], DATA, C, H);
  //       return cell;
  //     };

  //     for (let i = 0; i < this.cellsAmount; i += 1) {
  //       c.push(dl.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
  //       h.push(dl.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
  //       LSTMCells.push(lstm(i));
  //     }

  //     const userInput = Array.from(seed);

  //     const encodedInput = [];
  //     userInput.forEach((char, ind) => {
  //       if (ind < 100) {
  //         encodedInput.push(this.vocab[char]);
  //       }
  //     });

  //     let current = 0;
  //     let input = encodedInput[current];

  //     for (let i = 0; i < userInput.length + length; i += 1) {
  //       const onehotBuffer = dl.buffer([1, this.vocabSize]);
  //       onehotBuffer.set(1.0, 0, input);
  //       const onehot = onehotBuffer.toTensor();
  //       let output;
  //       if (this.model.embedding) {
  //         const embedded = dl.matMul(onehot, this.model.embedding);
  //         output = dl.multiRNNCell(LSTMCells, embedded, c, h);
  //       } else {
  //         output = dl.multiRNNCell(LSTMCells, onehot, c, h);
  //       }

  //       c = output[0];
  //       h = output[1];

  //       const outputH = h[1];
  //       const weightedResult = dl.matMul(outputH, this.model.fullyConnectedWeights);
  //       const logits = dl.add(weightedResult, this.model.fullyConnectedBiases);
  //       const divided = dl.div(logits, dl.tensor(temperature));
  //       const probabilities = dl.exp(divided);
  //       const normalized = await dl.div(
  //         probabilities,
  //         dl.sum(probabilities),
  //       ).data();

  //       const sampledResult = sampleFromDistribution(normalized);
  //       if (userInput.length > current) {
  //         input = encodedInput[current];
  //         current += 1;
  //       } else {
  //         input = sampledResult;
  //         results.push(sampledResult);
  //       }
  //     }

  //     let generated = '';
  //     results.forEach((char) => {
  //       const mapped = Object.keys(this.vocab).find(key => this.vocab[key] === char);
  //       if (mapped) {
  //         generated += mapped;
  //       }
  //     });
  //     callback({ generated });
  //   }
  // }
}

export default LSTMGenerator;
