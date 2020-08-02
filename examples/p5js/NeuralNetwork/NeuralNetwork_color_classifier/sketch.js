let neuralNetwork;
let submitButton;

let rSlider, gSlider, bSlider;
let labelP;
let lossP;

function setup() {
  // Crude interface
  lossP = createP('loss');

  createCanvas(100, 100);

  labelP = createP('label');

  rSlider = createSlider(0, 255, 255);
  gSlider = createSlider(0, 255, 0);
  bSlider = createSlider(0, 255, 255);

  const nnOptions = {
    dataUrl: 'data/colorData.json',
    inputs: ['r', 'g', 'b'],
    outputs: ['label'],
    task: 'classification',
    debug: true
  };
  neuralNetwork = ml5.neuralNetwork(nnOptions, modelReady);
}

function modelReady() {
  neuralNetwork.normalizeData();
  const trainingOptions = {
    epochs: 20,
    batchSize: 64
  }
  neuralNetwork.train(trainingOptions, whileTraining, finishedTraining);
  // Start guessing while training!
  classify();

}

function whileTraining(epoch, logs) {
  lossP.html(`Epoch: ${epoch} - loss: ${logs.loss.toFixed(2)}`);
}

function finishedTraining(anything) {
  console.log('done!');
}

function classify() {
  const inputs = {
    r: rSlider.value(),
    g: gSlider.value(),
    b: bSlider.value()
  }
  neuralNetwork.classify([inputs.r, inputs.g, inputs.b], gotResults);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
  } else {
    labelP.html(`label:${results[0].label}, confidence: ${results[0].confidence.toFixed(2)}`);
    classify();
  }
}

function draw() {
  background(rSlider.value(), gSlider.value(), bSlider.value());
}