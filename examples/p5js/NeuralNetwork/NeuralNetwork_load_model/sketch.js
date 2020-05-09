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
    task: 'classification',
    debug: true
  };
  neuralNetwork = ml5.neuralNetwork(nnOptions);

  // option 1: Load model explictly pointing to each file
  const modelDetails = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin'
  }
  neuralNetwork.load(modelDetails, modelReady);
  
  // option 2: Load model just pointing to the model file
  // neuralNetwork.load('model/model.json', modelReady);
}

function modelReady() {
  console.log('model loaded!')
  classify();
};


function classify() {
  const inputs = {
    r: rSlider.value(),
    g: gSlider.value(),
    b: bSlider.value()
  }
  neuralNetwork.classify(inputs, gotResults);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
  } else {
    // console.log(results)
    labelP.html(`label:${results[0].label}, confidence: ${results[0].confidence.toFixed(2)}`);
    classify();
  }
}

function draw() {
  background(rSlider.value(), gSlider.value(), bSlider.value());
}