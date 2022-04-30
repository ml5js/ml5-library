// The brain
let pixelBrain;

// The video and pixel scale
let video;
let ready = false;
const videoSize = 10;

// For sound synthesis
let frequency;
let osc;

// Going to normalize the data myself here
const freqMax = 800;

function setup() {
  createCanvas(200, 200);
  // Create the video and set resolution
  video = createCapture(VIDEO, videoReady);
  video.size(videoSize, videoSize);
  video.hide();

  // Inputs are total pixels times 3 (RGB)
  const totalPixels = videoSize * videoSize * 3;
  const options = {
    inputs: totalPixels,
    outputs: 1,
    learningRate: 0.01,
    task: "regression",
    debug: true,
  };
  // Create the model
  pixelBrain = ml5.neuralNetwork(options);

  // Buttons add trainin data and train model
  select("#addExample").mousePressed(addExample);
  select("#train").mousePressed(trainModel);
}

// Video is ready!
function videoReady() {
  ready = true;
}

function draw() {
  background(0);
  if (ready) {
    // Render the low-res image
    const w = width / videoSize;
    video.loadPixels();
    for (let x = 0; x < video.width; x += 1) {
      for (let y = 0; y < video.height; y += 1) {
        const index = (x + y * video.width) * 4;
        const r = video.pixels[index + 0];
        const g = video.pixels[index + 1];
        const b = video.pixels[index + 2];
        noStroke();
        fill(r, g, b);
        rect(x * w, y * w, w, w);
      }
    }
  }
}

// Package the pixels as inputs to a neural network
function getInputs() {
  video.loadPixels();
  // Create an array
  const inputs = [];
  for (let i = 0; i < video.width * video.height; i += 1) {
    const index = i * 4;
    // Manual normalization
    inputs.push(video.pixels[index + 0] / 255);
    inputs.push(video.pixels[index + 1] / 255);
    inputs.push(video.pixels[index + 2] / 255);
  }
  return inputs;
}

// Add an example
function addExample() {
  const freq = parseFloat(select("#frequency").value());
  video.loadPixels();
  const inputs = getInputs();
  // Manual normalization of frequency
  pixelBrain.addData(inputs, [freq / freqMax]);
}

function trainModel() {
  // Manually normalizing here!
  // pixelBrain.normalizeData();
  pixelBrain.train({ epochs: 50 }, finishedTraining);
}

// Training is done!
function finishedTraining() {
  console.log("done");

  // Start sound
  osc = new p5.Oscillator();
  osc.setType("sine");
  osc.amp(0.5);
  osc.freq(440);
  osc.start();
  osc.amp(0.5);

  // Start predicting
  predict();
}

function predict() {
  const inputs = getInputs();
  pixelBrain.predict(inputs, gotFrequency);
}

function gotFrequency(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // Manual "un-normalization"
  frequency = parseFloat(results[0].value) * freqMax;

  // Display frequency
  select("#prediction").html(frequency.toFixed(2));
  // Set frequency
  osc.freq(parseFloat(frequency));
  // Predict again
  predict();
}
