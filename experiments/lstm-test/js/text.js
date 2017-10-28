// Generate Text with a LSTM

import { Array1D, Array2D, Array3D, CheckpointLoader, NDArrayMathGPU, Scalar, util } from 'deeplearn';

let lstmKernel, lstmBias;

const results = [];
let checkpointsLoaded = false;
let math = new NDArrayMathGPU();

let char_indices = { '\n': 0, ' ': 1, '!': 2, '&': 3, "'": 4, ',': 5, '-': 6, '.': 7, '1': 8, '2': 9, ':': 10, ';': 11, '?': 12, '[': 13, ']': 14, 'a': 15, 'b': 16, 'c': 17, 'd': 18, 'e': 19, 'f': 20, 'g': 21, 'h': 22, 'i': 23, 'j': 24, 'k': 25, 'l': 26, 'm': 27, 'n': 28, 'o': 29, 'p': 30, 'q': 31, 'r': 32, 's': 33, 't': 34, 'u': 35, 'v': 36, 'w': 37, 'x': 38, 'y': 39, 'z': 40 };

let indices_char = {0: '\n', 1: ' ', 2: '!', 3: '&', 4: "'", 5: ',', 6: '-', 7: '.', 8: '1', 9: '2', 10: ':', 11: ';', 12: '?', 13: '[', 14: ']', 15: 'a', 16: 'b', 17: 'c', 18: 'd', 19: 'e', 20: 'f', 21: 'g', 22: 'h', 23: 'i', 24: 'j', 25: 'k', 26: 'l', 27: 'm', 28: 'n', 29: 'o', 30: 'p', 31: 'q', 32: 'r', 33: 's', 34: 't', 35: 'u', 36: 'v', 37: 'w', 38: 'x', 39: 'y', 40: 'z'};

const reader = new CheckpointLoader('./models/hamlet-keras');
reader.getAllVariables().then(vars => {
  lstmKernel = vars['lstm_1_3/recurrent_kernel'];
  lstmBias = vars['lstm_1_3/bias'];

  checkpointsLoaded = true;
});

// Generate Text
let generateText = () => {

  if (!checkpointsLoaded) {
    setTimeout(() => {
      generateText();
    }, 100);
  } else {

    math.scope((keep, track) => {
      const forgetBias = track(Scalar.new(1.0));
      const lstm = math.basicLSTMCell.bind(math, forgetBias, lstmKernel, lstmBias);

      let c = [
        track(Array2D.zeros([1, lstmBias.shape[0] / 4]))
      ];
      let h = [
        track(Array2D.zeros([1, lstmBias.shape[0] / 4]))
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

        const output = math.([lstm], onehot, c, h);

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