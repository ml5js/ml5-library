/*
Predict a drawn number.
*/

import { CheckpointLoader, NDArrayMathGPU, Session, Graph, Array1D } from 'deeplearn';

let input, probs, session;

const math = new NDArrayMathGPU();

let reader = new CheckpointLoader('model/');
reader.getAllVariables().then((checkpoints) => {
  let graphModel = buildModelGraph(checkpoints);
  input = graphModel[0];
  probs = graphModel[1];
  session = new Session(input.node.graph, math);
});

let predict = (data, resultTag) => {
  math.scope((keep, track) => {
    let inputData = track(Array1D.new(data));
    let probsVal = session.eval(probs, [{
      tensor: input,
      data: inputData
    }]);
    console.log('Prediction: ' + probsVal.get());
    resultTag.html('Prediction: ' + probsVal.get());
  });
};

let buildModelGraph = (checkpoints) => {
  let g = new Graph();
  let input = g.placeholder('input', [784]);
  let hidden1W = g.constant(checkpoints['hidden1/weights']);
  let hidden1B = g.constant(checkpoints['hidden1/biases']);
  let hidden1 = g.relu(g.add(g.matmul(input, hidden1W), hidden1B));
  let hidden2W = g.constant(checkpoints['hidden2/weights']);
  let hidden2B = g.constant(checkpoints['hidden2/biases']);
  let hidden2 = g.relu(g.add(g.matmul(hidden1, hidden2W), hidden2B));
  let softmaxW = g.constant(checkpoints['softmax_linear/weights']);
  let softmaxB = g.constant(checkpoints['softmax_linear/biases']);
  let logits = g.add(g.matmul(hidden2, softmaxW), softmaxB);
  return [input, g.argmax(logits)];
};

export { predict };