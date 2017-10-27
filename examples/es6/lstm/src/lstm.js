// Generate Text with a LSTM

import { Array1D, Array2D, Array3D, CheckpointLoader, NDArrayMathGPU, Scalar, util } from 'deeplearn';

import { hamlet } from './hamlet';

let lstmKernel1, lstmBias1, lstmKernel2, lstmBias2, fullyConnectedBiases, fullyConnectedWeights;

let checkpointsLoaded = false;
let math = new NDArrayMathGPU();

let text = hamlet.toLowerCase();
let maxlen = 40;

let char_indices = {'\n': 0, ' ': 1, '(': 2, ')': 3, ',': 4, '.': 5, 'a': 6, 'b': 7, 'c': 8, 'd': 9, 'e': 10, 'f': 11, 'g': 12, 'h': 13, 'i': 14, 'j': 15, 'k': 16, 'l': 17, 'm': 18, 'n': 19, 'o': 20, 'p': 21, 'q': 22, 'r': 23, 's': 24, 't': 25, 'u': 26, 'v': 27, 'w': 28, 'x': 29, 'y': 30, 'z': 31};
let indices_char = {0: '\n', 1: ' ', 2: '(', 3: ')', 4: ',', 5: '.', 6: 'a', 7: 'b', 8: 'c', 9: 'd', 10: 'e', 11: 'f', 12: 'g', 13: 'h', 14: 'i', 15: 'j', 16: 'k', 17: 'l', 18: 'm', 19: 'n', 20: 'o', 21: 'p', 22: 'q', 23: 'r', 24: 's', 25: 't', 26: 'u', 27: 'v', 28: 'w', 29: 'x', 30: 'y', 31: 'z'};


const reader = new CheckpointLoader('./models/itp');
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
let lstm = (data, callback) => {
  const results = [];

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

      let userInput = Array.from(data.seed);

      let encoded_input = [];
      userInput.forEach((char, ind) => {
        encoded_input.push(char_indices[char]);
      });

      let current = 0;
      let input = encoded_input[current];

      for (let i = 0; i < userInput.length + data.length; i++) {
        const onehot = track(Array2D.zeros([1, 32]));
        onehot.set(1.0, 0, input);

        const output = math.multiRNNCell([lstm1, lstm2], onehot, c, h);

        c = output[0];
        h = output[1];
    
        const outputH = h[1];
        const weightedResult = math.matMul(outputH, fullyConnectedWeights);
        const logits = math.add(weightedResult, fullyConnectedBiases);

        const result = math.argMax(logits).get();


        current++;

        if(current < userInput.length){
          input = encoded_input[current];
        } else {
          results.push(indices_char[result]);
          input = result;  
        }
        
      }
    });
    let output = results.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    });

    callback({
      sentence: output
    })

  }

};

export { lstm };