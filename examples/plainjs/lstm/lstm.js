// Generate Text with a LSTM

let math = new deeplearn.NDArrayMathGPU();
let reader;
let lstmKernel1, lstmBias1, lstmKernel2, lstmBias2, fullyConnectedBiases, fullyConnectedWeights;
let checkpointsLoaded;

let char_indices = { ' ': 0, '!': 1, '&': 2, "'": 3, ',': 4, '-': 5, '.': 6, '1': 7, '2': 8, ':': 9, ';': 10, '?': 11, '[': 12, ']': 13, 'a': 14, 'b': 15, 'c': 16, 'd': 17, 'e': 18, 'f': 19, 'g': 20, 'h': 21, 'i': 22, 'j': 23, 'k': 24, 'l': 25, 'm': 26, 'n': 27, 'o': 28, 'p': 29, 'q': 30, 'r': 31, 's': 32, 't': 33, 'u': 34, 'v': 35, 'w': 36, 'x': 37, 'y': 38, 'z': 39 }
let indices_char = { 0: ' ', 1: '!', 2: '&', 3: "'", 4: ',', 5: '-', 6: '.', 7: '1', 8: '2', 9: ':', 10: ';', 11: '?', 12: '[', 13: ']', 14: 'a', 15: 'b', 16: 'c', 17: 'd', 18: 'e', 19: 'f', 20: 'g', 21: 'h', 22: 'i', 23: 'j', 24: 'k', 25: 'l', 26: 'm', 27: 'n', 28: 'o', 29: 'p', 30: 'q', 31: 'r', 32: 's', 33: 't', 34: 'u', 35: 'v', 36: 'w', 37: 'x', 38: 'y', 39: 'z' };

// Load the model checkpoints
function initLSTM() {
  checkpointsLoaded = false;
  let text = hamlet.toLowerCase();
  let maxlen = 40;

  reader = new deeplearn.CheckpointLoader('./models/hamlet');
  reader.getAllVariables().then(vars => {
    lstmKernel1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/weights'];
    lstmBias1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/biases'];

    lstmKernel2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/weights'];
    lstmBias2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/biases'];

    fullyConnectedBiases = vars['fully_connected/biases'];
    fullyConnectedWeights = vars['fully_connected/weights'];
    checkpointsLoaded = true;
  });
}

// Generate Text
function lstm(data, callback) {
  const results = [];

  if (!checkpointsLoaded) {
    setTimeout(() => {
      predictNextNumber();
    }, 100);
  } else {

    math.scope((keep, track) => {
      const forgetBias = track(deeplearn.Scalar.new(1.0));
      const lstm1 = math.basicLSTMCell.bind(math, forgetBias, lstmKernel1, lstmBias1);
      const lstm2 = math.basicLSTMCell.bind(math, forgetBias, lstmKernel2, lstmBias2);

      let c = [
        track(deeplearn.Array2D.zeros([1, lstmBias1.shape[0] / 4])),
        track(deeplearn.Array2D.zeros([1, lstmBias2.shape[0] / 4]))
      ];
      let h = [
        track(deeplearn.Array2D.zeros([1, lstmBias1.shape[0] / 4])),
        track(deeplearn.Array2D.zeros([1, lstmBias2.shape[0] / 4]))
      ];

      let userInput = Array.from(data.seed);

      let encoded_input = [];
      userInput.forEach((char, ind) => {
        encoded_input.push(char_indices[char]);
      });

      let current = 0;
      let input = encoded_input[current];

      for (let i = 0; i < userInput.length + data.length; i++) {
        const onehot = track(deeplearn.Array2D.zeros([1, 40]));
        onehot.set(1.0, 0, input);

        const output = math.multiRNNCell([lstm1, lstm2], onehot, c, h);

        c = output[0];
        h = output[1];

        const outputH = h[1];
        const weightedResult = math.matMul(outputH, fullyConnectedWeights);
        const logits = math.add(weightedResult, fullyConnectedBiases);

        const result = math.argMax(logits).get();


        current++;

        if (current < userInput.length) {
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