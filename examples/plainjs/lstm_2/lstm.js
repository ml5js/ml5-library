// Generate Text with a LSTM

let lstmKernel1, lstmBias1, lstmKernel2, lstmBias2, fullyConnectedBiases, fullyConnectedWeights;

let checkpointsLoaded = false;
let math = new deeplearn.NDArrayMathGPU();

const reader = new deeplearn.CheckpointLoader('../../../models/lstm/itp/');
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
      deeplearn.predictNextNumber();
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
        encoded_input.push(variables.char_indices[char]);
      });

      let current = 0;
      let input = encoded_input[current];

      for (let i = 0; i < userInput.length + data.length; i++) {
        const onehot = track(deeplearn.Array2D.zeros([1, variables.NLABELS]));
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
          results.push(variables.indices_char[result]);
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
