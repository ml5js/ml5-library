//rnn

import { Array1D, Array2D, Array3D, CheckpointLoader, NDArrayMathGPU, Scalar, util } from 'deeplearn';

let lstmKernel1, lstmBias1, lstmKernel2, lstmBias2, fullyConnectedBiases, fullyConnectedWeights, embeddingWeights;

let checkpointsLoaded = false;
let math = new NDArrayMathGPU();

let vocab = { '\n': 10, '!': 46, ' ': 0, '$': 64, "'": 30, '&': 63, '-': 48, ',': 16, '.': 25, '3': 62, ';': 38, ':': 24, '?': 44, 'A': 26, 'C': 37, 'B': 43, 'E': 31, 'D': 47, 'G': 45, 'F': 49, 'I': 21, 'H': 41, 'K': 52, 'J': 58, 'M': 42, 'L': 36, 'O': 32, 'N': 33, 'Q': 59, 'P': 51, 'S': 35, 'R': 34, '': 40, 'T': 29, 'W': 39, 'V': 53, 'Y': 50, 'X': 61, 'Z': 60, 'a': 4, 'c': 19, 'b': 22, 'e': 1, 'd': 12, 'g': 20, 'f': 18, 'i': 9, 'h': 5, 'k': 28, 'j': 54, 'm': 14, 'l': 11, 'o': 3, 'n': 8, 'q': 55, 'p': 23, 's': 6, 'r': 7, '': 13, 't': 2, 'w': 17, 'v': 27, 'y': 15, 'x': 56, 'z': 57 };

let chars = [' ', 'e', 't', 'o', 'a', 'h', 's', 'r', 'n', 'i', '\n', 'l', 'd', '', 'm', 'y', ',', 'w', 'f', 'c', 'g', 'I', 'b', 'p', ':', '.', 'A', 'v', 'k', 'T', "'", 'E', 'O', 'N', 'R', 'S', 'L', 'C', ';', 'W', '', 'H', 'M', 'B', '?', 'G', '!', 'D', '-', 'F', 'Y', 'P', 'K', 'V', 'j', 'q', 'x', 'z', 'J', 'Q', 'Z', 'X', '3', '&', '$'];

const reader = new CheckpointLoader('../../../models/shakespear/');
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
let generateText = () => {
  const results = [];

  if (!checkpointsLoaded) {
    setTimeout(() => {
      generateText();
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

      let input = 20;
      for (let i = 0; i < 500; i++) {
        const onehot = track(Array2D.zeros([1, 65]));

        onehot.set(1.0, 0, input);

        const embedded = math.matMul(onehot, embeddingWeights);

        const output = math.multiRNNCell([lstm1, lstm2], embedded, c, h);

        c = output[0];
        h = output[1];

        const outputH = h[1];
        const weightedResult = math.matMul(outputH, fullyConnectedWeights);
        const logits = math.add(weightedResult, fullyConnectedBiases);

        const result = math.argMax(logits).get();
        
        const divided = math.arrayDividedByScalar(logits, Scalar.new(0.25));
        const probabilities = math.exp(divided);
        const normalized = math.divide(probabilities, math.sum(probabilities)).getValues();
        const randValue = Math.random();
        var sum = 0;
        var j = 0;
        for (; j < normalized.length; j++){
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
      generated += Object.keys(vocab).find(key => vocab[key] === c);
    })
    console.log(generated)

    // let output = results.reduce((accumulator, currentValue) => {
    //   return accumulator + currentValue;
    // });
    // return output
  }

};

export { generateText };