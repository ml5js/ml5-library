// LSTM Pi numbers Demo
import { Array1D, Array2D, CheckpointLoader, NDArrayMathGPU, Scalar, util } from 'deeplearn';

let lstmKernel1, lstmBias1, lstmKernel2, lstmBias2, fullyConnectedBiases, fullyConnectedWeights;

const results = [];
let input = 3;
let checkpointsLoaded = false;

const reader = new CheckpointLoader('./models/pi');
reader.getAllVariables().then(vars => {
  lstmKernel1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/weights'];
  lstmBias1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/biases'];

  lstmKernel2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/weights'];
  lstmBias2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/biases'];

  fullyConnectedBiases = vars['fully_connected/biases'];
  fullyConnectedWeights = vars['fully_connected/weights'];
  checkpointsLoaded = true;
});

let math = new NDArrayMathGPU();

// Predict Pi numbers.
let predictPi = () => {
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

      for (let i = 0; i < 22; i++) {
        const onehot = track(Array2D.zeros([1, 10]));
        onehot.set(1.0, 0, input);

        const output = math.multiRNNCell([lstm1, lstm2], onehot, c, h);

        c = output[0];
        h = output[1];

        const outputH = h[1];
        const weightedResult = math.matMul(outputH, fullyConnectedWeights);
        const logits = math.add(weightedResult, fullyConnectedBiases);

        const result = math.argMax(logits).get();
        results.push(result);
        input = result;
      }
    });
    return results.reduce((accumulator, currentValue) => {
      return String(accumulator) + String(currentValue);
    });
  }

};

export { predictPi };