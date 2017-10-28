// Generate Text with a LSTM

import { Array1D, Array2D, Array3D, CheckpointLoader, NDArrayMathGPU, Scalar, util } from 'deeplearn';

import { variables } from './variables';

let lstmKernel1, lstmBias1, lstmKernel2, lstmBias2, fullyConnectedBiases, fullyConnectedWeights, embeddingWeights;

let checkpointsLoaded = false;
let math = new NDArrayMathGPU();

const reader = new CheckpointLoader('./../../../models/lstm/shakespear/');
reader.getAllVariables().then(vars => {
  embeddingWeights = vars['embedding'];

  lstmKernel1 = vars['rnnlm/multi_rnn_cell/cell_0/basic_lstm_cell/weights'];
  lstmBias1 = vars['rnnlm/multi_rnn_cell/cell_0/basic_lstm_cell/biases'];

  lstmKernel2 = vars['rnnlm/multi_rnn_cell/cell_1/basic_lstm_cell/weights'];
  lstmBias2 = vars['rnnlm/multi_rnn_cell/cell_1/basic_lstm_cell/biases'];

  fullyConnectedBiases = vars['rnnlm/softmax_b'];
  fullyConnectedWeights = vars['rnnlm/softmax_w'];
  checkpointsLoaded = true;
});

// Generate Text
let lstm = (data, callback) => {
  const results = [];

  if (!checkpointsLoaded) {
    setTimeout(() => {
      lstm(data, callback);
    }, 100);
  } else {

    math.scope((keep, track) => {
      const forgetBias = track(Scalar.new(1.0));
      const lstm1 = math.basicLSTMCell.bind(math, forgetBias, lstmKernel1, lstmBias1);
      const lstm2 = math.basicLSTMCell.bind(math, forgetBias, lstmKernel2, lstmBias2);

      let c = [
        track(Array2D.zeros([1, lstmBias1.shape[0] / 4])),
        track(Array2D.zeros([1, lstmBias2.shape[0] / 4]))
      ];
      let h = [
        track(Array2D.zeros([1, lstmBias1.shape[0] / 4])),
        track(Array2D.zeros([1, lstmBias2.shape[0] / 4]))
      ];

      let userInput = Array.from(data.seed);

      let encoded_input = [];
      userInput.forEach((char, ind) => {
        encoded_input.push(variables.vocab[char]);
      });

      let current = 0;
      let input = encoded_input[current];

      for (let i = 0; i < userInput.length + data.length; i++) {
        const onehot = track(Array2D.zeros([1, variables.NLABELS]));
        onehot.set(1.0, 0, input);
        const embedded = math.matMul(onehot, embeddingWeights);

        const output = math.multiRNNCell([lstm1, lstm2], embedded, c, h);

        c = output[0];
        h = output[1];

        const outputH = h[1];
        const weightedResult = math.matMul(outputH, fullyConnectedWeights);
        const logits = math.add(weightedResult, fullyConnectedBiases);
        const result = math.argMax(logits).get();

        const divided = math.arrayDividedByScalar(logits, Scalar.new(data.temperature));
        const probabilities = math.exp(divided);
        const normalized = math.divide(probabilities, math.sum(probabilities)).getValues();
        const randValue = Math.random();
        let sum = 0;
        let j = 0;
        for (; j < normalized.length; j++) {
          sum += normalized[j];
          if (randValue < sum) {
            break;
          }
        }
        results.push(j);
        input = j;

      }
    });

    let generated = '';

    results.forEach((c, i) => {
      generated += Object.keys(variables.vocab).find(key => variables.vocab[key] === c);
    })

    callback({
      sentence: generated
    })

  }

};

export { lstm };