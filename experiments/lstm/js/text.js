// Generate Text with a LSTM

import { Array1D, Array2D, Array3D, CheckpointLoader, NDArrayMathGPU, Scalar, util } from 'deeplearn';

import { hamlet } from './hamlet';

let lstmKernel1, lstmBias1, lstmKernel2, lstmBias2, fullyConnectedBiases, fullyConnectedWeights;

const results = [];
let checkpointsLoaded = false;
let math = new NDArrayMathGPU();

let randomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let text = hamlet.toLowerCase();
let maxlen = 40;
let chars = Array.from(new Set(Array.from(text))).sort(); // \n for ↵ ?
let char_indices = chars.reduce((acc, cur, i) => {
  acc[cur] = i;
  return acc;
}, {});
let indices_char = chars.reduce((acc, cur, i) => {
  acc[i] = cur;
  return acc;
}, {});

let start_index = randomInt(0, text.length - maxlen - 1);
let diversity = 0.5;
let generated = '';
let sentence = text.substring(start_index, start_index + maxlen);
generated += sentence;

const reader = new CheckpointLoader('./models/hamlet');
reader.getAllVariables().then(vars => {
  lstmKernel1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/weights'];
  lstmBias1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/biases'];

  lstmKernel2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/weights'];
  lstmBias2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/biases'];

  fullyConnectedBiases = vars['fully_connected/biases'];
  fullyConnectedWeights = vars['fully_connected/weights'];
  checkpointsLoaded = true;
});

// Generate Text
let generateText = () => {

  if (!checkpointsLoaded) {
    setTimeout(() => {
      predictNextNumber();
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


      let userInput = Array.from('ham');
      let encoded_input = [];
      userInput.forEach((char, ind) => {
        encoded_input.push(char_indices[char]);
        results.push(char);
      });

      let input = encoded_input[0];

      let length = encoded_input.length + 20;

      for (let i = 0; i < length; i++) {
        const onehot = track(Array2D.zeros([1, 41]));
        onehot.set(1.0, 0, input);

        const output = math.multiRNNCell([lstm1, lstm2], onehot, c, h);

        c = output[0];
        h = output[1];

        const outputH = h[1];
        const weightedResult = math.matMul(outputH, fullyConnectedWeights);
        const logits = math.add(weightedResult, fullyConnectedBiases);

        const result = math.argMax(logits).get();
        results.push(indices_char[result]);
        input = result;
      }
    });
    return results.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    });
  }

};

export { generateText };