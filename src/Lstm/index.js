/*
A LSTM Generator: run inference mode for a LSTM.
Currently working with models trained using https://github.com/sherjilozair/char-rnn-tensorflow
*/

import { Array1D, Array2D, CheckpointLoader, Scalar } from 'deeplearn';
import { math, sampleFromDistribution } from './../utils';

let regexCell = /cell_[0-9]|lstm_[0-9]/gi;
let regexWeights = /weights|weight|kernel|kernels|w/gi;
let regexBiases = /biases|bias|b/gi;
let regexFullyConnected = /softmax/gi;

class LSTMGenerator {
  constructor(modelPath) {
    this.checkpointsLoaded = false;
    this.model = {};
    this.loadCheckpoints(modelPath);
    this.loadVocab(modelPath);
  }

  // Load checkpoints
  loadCheckpoints(path) {
    let reader = new CheckpointLoader(path);
    reader.getAllVariables().then(vars => {
      this.cellsAmount = 0;
      for (let key in vars) {
        if (key.match(regexCell)) {
          if (key.match(regexWeights)) {
            this.model[`Kernel_${key.match(/[0-9]/)[0]}`] = vars[key];
            this.cellsAmount++;
          } else {
            this.model[`Bias_${key.match(/[0-9]/)[0]}`] = vars[key];
          }
        } else if (key.match(regexFullyConnected)) {
          if (key.match(regexWeights)) {
            this.model[`fullyConnectedWeights`] = vars[key];
          } else {
            this.model[`fullyConnectedBiases`] = vars[key];
          }
        } else {
          this.model[key] = vars[key];
        }
      }
      this.checkpointsLoaded = true;
    });
  }

  loadVocab(path) {
    fetch(`${path}/vocab.json`)
      .then(response => response.json())
      .then(json => {
        this.vocab = json;
        this.vocabSize = Object.keys(json).length;
      });
  }

  // Generate text
  generate(options, callback) {
    options.seed || (options.seed = 'a');
    options.length || (options.length = 20);
    options.temperature || (options.temperature = 0.5);
    const results = [];

    if (!this.checkpointsLoaded) {
      setTimeout(() => {
        this.generate(options, callback);
      }, 100);
    } else {
      math.scope((keep, track) => {
        const forgetBias = track(Scalar.new(1.0));

        let LSTMCells = [];
        let c = [];
        let h = [];

        for (let i = 0; i < this.cellsAmount; i++) {
          LSTMCells.push(
            math.basicLSTMCell.bind(math, forgetBias, this.model[`Kernel_${i}`], this.model[`Bias_${i}`])
          );
          c.push(track(Array2D.zeros([1, this.model[`Bias_${i}`].shape[0] / 4])));
          h.push(track(Array2D.zeros([1, this.model[`Bias_${i}`].shape[0] / 4])));
        }

        let userInput = Array.from(options.seed);

        let encoded_input = [];
        userInput.forEach((char, ind) => {
          ind < 100 && encoded_input.push(this.vocab[char]);
        });

        let current = 0;
        let input = encoded_input[current];

        for (let i = 0; i < userInput.length + options.length; i++) {
          const onehot = track(Array2D.zeros([1, this.vocabSize]));
          onehot.set(1.0, 0, input);
          
          let output;
          if (this.model.embedding) {
            const embedded = math.matMul(onehot, this.model.embedding);
            output = math.multiRNNCell(LSTMCells, embedded, c, h);
          } else {
            output = math.multiRNNCell(LSTMCells, onehot, c, h);
          }

          c = output[0];
          h = output[1];

          const outputH = h[1];
          const weightedResult = math.matMul(outputH, this.model.fullyConnectedWeights);
          const logits = math.add(weightedResult, this.model.fullyConnectedBiases);
 
          const divided = math.arrayDividedByScalar(logits, Scalar.new(options.temperature));
          const probabilities = math.exp(divided);
          const normalized = math.divide(probabilities, math.sum(probabilities)).getValues();
          let sampledResult = sampleFromDistribution(normalized);

          if(userInput.length > current){
            current++;
            input = encoded_input[current];
          } else {
            input = sampledResult;
            results.push(sampledResult);
          }
        }
      });

      let generated = '';

      results.forEach((c, i) => {
        let mapped = Object.keys(this.vocab).find(key => this.vocab[key] === c);
        mapped && (generated += mapped)
      })

      callback({
        generated: generated
      })
    }

  }


}



export { LSTMGenerator }