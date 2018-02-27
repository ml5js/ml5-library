/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
A LSTM Generator: Run inference mode for a LSTM.
Currently working with models trained using https://github.com/sherjilozair/char-rnn-tensorflow
*/

import { ENV, Array2D, CheckpointLoader, Scalar } from 'deeplearn';
import sampleFromDistribution from './../utils/sample';

const regexCell = /cell_[0-9]|lstm_[0-9]/gi;
const regexWeights = /weights|weight|kernel|kernels|w/gi;
const regexFullyConnected = /softmax/gi;

class LSTMGenerator {
  constructor(model) {
    this.ready = false;
    this.model = {};
    this.math = ENV.math;
    this.cellsAmount = 0;
    this.vocab = {};
    this.vocabSize = 0;
    this.defaults = {
      seed: 'a',
      length: 20,
      temperature: 0.5,
    };
    this.loadVocab(model);
    this.loadCheckpoints(model);
  }

  loadCheckpoints(path) {
    const reader = new CheckpointLoader(path);
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
      this.ready = true;
    });
  }

  loadVocab(file) {
    fetch(`${file}/vocab.json`)
      .then(response => response.json())
      .then((json) => {
        this.vocab = json;
        this.vocabSize = Object.keys(json).length;
      }).catch((error) => {
        console.log(`There has been a problem loading the vocab: ${error.message}`);
      });
  }

  async generate(options, callback) {
    const seed = options.seed || this.defaults.seed;
    const length = +options.length || this.defaults.length;
    const temperature = +options.temperature || this.defaults.temperature;
    const results = [];

    if (this.ready) {
      await this.math.scope(async () => {
        const forgetBias = Scalar.new(1.0);
        const LSTMCells = [];
        let c = [];
        let h = [];

        for (let i = 0; i < this.cellsAmount; i += 1) {
          LSTMCells.push(this.math.basicLSTMCell.bind(this.math, forgetBias, this.model[`Kernel_${i}`], this.model[`Bias_${i}`]));
          c.push(Array2D.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
          h.push(Array2D.zeros([1, this.model[`Bias_${i}`].shape[0] / 4]));
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
          const onehot = Array2D.zeros([1, this.vocabSize]);
          onehot.set(1.0, 0, input);
          let output;
          if (this.model.embedding) {
            const embedded = this.math.matMul(onehot, this.model.embedding);
            output = this.math.multiRNNCell(LSTMCells, embedded, c, h);
          } else {
            output = this.math.multiRNNCell(LSTMCells, onehot, c, h);
          }

          c = output[0];
          h = output[1];

          const outputH = h[1];
          const weightedResult = this.math.matMul(outputH, this.model.fullyConnectedWeights);
          const logits = this.math.add(weightedResult, this.model.fullyConnectedBiases);
          const divided = this.math.arrayDividedByScalar(logits, Scalar.new(temperature));
          const probabilities = await this.math.exp(divided);
          const normalized = await this.math.divide(
            probabilities,
            this.math.sum(probabilities),
          ).dataSync();
          const sampledResult = sampleFromDistribution(normalized);

          if (userInput.length > current) {
            input = encodedInput[current];
            current += 1;
          } else {
            input = sampledResult;
            results.push(sampledResult);
          }
        }
      });

      let generated = '';
      results.forEach((c) => {
        const mapped = Object.keys(this.vocab).find(key => this.vocab[key] === c);
        if (mapped) {
          generated += mapped;
        }
      });
      callback({ generated });
    }
  }
}

export default LSTMGenerator;
