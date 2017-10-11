// Generate Text with a LSTM

import { Array1D, Array2D, Array3D, CheckpointLoader, NDArrayMathGPU, Scalar, util } from 'deeplearn';
import { hamlet } from './hamlet';
let lstmKernel1, lstmBias1, fullyConnectedBiases, fullyConnectedWeights;

const results = [];
let checkpointsLoaded = false;

let input, probs, session;

let sample = (preds, temperature) => {
  preds = '';
};

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
  lstmKernel1 = vars['lstm_1_3/kernel'];
  lstmBias1 = vars['lstm_1_3/bias'];

  fullyConnectedBiases = vars['dense_1_3/bias'];
  fullyConnectedWeights = vars['dense_1_3/kernel'];
  checkpointsLoaded = true;
});

// Generate Text
let generateText = () => {
  let math = new NDArrayMathGPU();

  if (!checkpointsLoaded) {
    setTimeout(() => {
      predictNextNumber();
    }, 100);
  } else {

    math.scope((keep, track) => {

      const forgetBias = track(Scalar.new(1.0));
      const lstm1 = math.basicLSTMCell.bind(math, forgetBias, lstmKernel1, lstmBias1);

      let c = [
        track(Array2D.zeros([1, lstmBias1.shape[0] / 4])),
      ];
      let h = [
        track(Array2D.zeros([1, lstmBias1.shape[0] / 4])),
      ];

      // Generate x amount of characters
      let charsToGenerate = 1;
      for (let i = 0; i < charsToGenerate; i++) {
        const onehot = track(Array3D.zeros([1, maxlen, chars.length]));
        for (let t = 0; t < sentence.length; t++) {
          onehot.set(1.0, 0, t, char_indices[sentence[t]]);
        }

        console.log('onehot shape is ', onehot.shape, onehot);
        console.log('lstmBias1.shape[0]', lstmBias1.shape);
        console.log('c shape is ', c[0].shape, c);
        console.log('h shape is ', h[0].shape, h);

        // Error in vectorTimesMatrix: size of vector (1768) must match first dimension of matrix (41)
        // ¿?
        const output = math.multiRNNCell([lstm1], onehot, c, h);
        console.log('output', output);

        // c = output[0];
        // h = output[1];

        // const outputH = h[1];
        // const weightedResult = math.matMul(outputH, fullyConnectedWeights);
        // const logits = math.add(weightedResult, fullyConnectedBiases);

        // const result = math.argMax(logits).get();
        // console.log(result);
        // results.push(result);
        // input = result;

      }
    });
    math = null;
  }

};

export { generateText };