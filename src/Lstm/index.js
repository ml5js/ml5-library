/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
A LSTM Generator: Run inference mode for a pre-trained LSTM.
*/

import * as dl from 'deeplearn';
import sampleFromDistribution from './../utils/sample';

const regexCell = /cell_[0-9]|lstm_[0-9]/gi;
const regexWeights = /weights|weight|kernel|kernels|w/gi;
const regexFullyConnected = /softmax/gi;

class LSTMGenerator {
  constructor(model, callback) {
    this.ready = false;
    this.model = {};
    this.cellsAmount = 0;
    this.vocab = {};
    this.vocabSize = 0;
    this.defaults = {
      seed: 'a',
      length: 20,
      temperature: 0.5,
    };
    this.loadCheckpoints(model, callback);
  }

  loadCheckpoints(path, callback) {
    const reader = new dl.CheckpointLoader(path);
    reader.getAllVariables().then(async (vars) => {
      Object.keys(vars).forEach((key) => {
        if (key.match(regexCell)) {
          if (key.match(regexWeights)) {
            this.model[`Kernel_${key.match(/[0-9]/)[0]}`] = vars[key];
            this.cellsAmount += 1;
          } else {
            this.model[`Bias_${key.match(/[0-9]/)[0]}`] = vars[key];
          }
        } else if (key.match(regexFullyConnected)) {
          if (key.match(regexWeights)) {
            this.model.fullyConnectedWeights = vars[key];
          } else {
            this.model.fullyConnectedBiases = vars[key];
          }
        } else {
          this.model[key] = vars[key];
        }
      });
      this.loadVocab(path, callback);
    });
  }

  loadVocab(file, callback) {
    fetch(`${file}/vocab.json`)
      .then(response => response.json())
      .then((json) => {
        this.vocab = json;
        this.vocabSize = Object.keys(json).length;
        this.ready = true;
        callback();
      }).catch((error) => {
        console.error(`There has been a problem loading the vocab: ${error.message}`);
      });
  }

  async generate(options, callback) {
    const seed = options.seed || this.defaults.seed;
    const length = +options.length || this.defaults.length;
    const temperature = +options.temperature || this.defaults.temperature;
    const results = [];

    if (this.ready) {
      const forgetBias = dl.scalar(1.0);
      const LSTMCells = [];
      let c = [];
      let h = [];

      const lstm = (i) => {
        const cell = (DATA, C, H) => dl.basicLSTMCell(forgetBias, this.model[`Kernel_${i}`], this.model[`Bias_${i}`], DATA, C, H);
        return cell;
      };

      for (let i = 0; i < this.cellsAmount; i += 1) {
        c.push(dl.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
        h.push(dl.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
        LSTMCells.push(lstm(i));
      }

      const userInput = Array.from(seed);

      const encodedInput = [];
      userInput.forEach((char, ind) => {
        if (ind < 100) {
          encodedInput.push(this.vocab[char]);
        }
      });

      let current = 0;
      let input = encodedInput[current];

      for (let i = 0; i < userInput.length + length; i += 1) {
        const onehotBuffer = dl.buffer([1, this.vocabSize]);
        onehotBuffer.set(1.0, 0, input);
        const onehot = onehotBuffer.toTensor();
        let output;
        if (this.model.embedding) {
          const embedded = dl.matMul(onehot, this.model.embedding);
          output = dl.multiRNNCell(LSTMCells, embedded, c, h);
        } else {
          output = dl.multiRNNCell(LSTMCells, onehot, c, h);
        }

        c = output[0];
        h = output[1];

        const outputH = h[1];
        const weightedResult = dl.matMul(outputH, this.model.fullyConnectedWeights);
        const logits = dl.add(weightedResult, this.model.fullyConnectedBiases);
        const divided = dl.div(logits, dl.scalar(temperature));
        const probabilities = dl.exp(divided);
        const normalized = await dl.div(
          probabilities,
          dl.sum(probabilities),
        ).data();

        const sampledResult = sampleFromDistribution(normalized);
        if (userInput.length > current) {
          input = encodedInput[current];
          current += 1;
        } else {
          input = sampledResult;
          results.push(sampledResult);
        }
      }

      let generated = '';
      results.forEach((char) => {
        const mapped = Object.keys(this.vocab).find(key => this.vocab[key] === char);
        if (mapped) {
          generated += mapped;
        }
      });
      callback({ generated });
    }
  }
}

export default LSTMGenerator;
