
// ml5 Face Detection Model
let faceapi;
let detections = [];

// Video
let video;

// ml5 neural network
let faceBrain;

//  Sound
let osc;
const freqMax = 800;

// Keeping track of state
const trained = false;
let collecting = false;

function setup() {
  createCanvas(360, 270);

  // Creat the video and start face tracking
  video = createCapture(VIDEO);
  video.size(width, height);
  // Only need landmarks for this example
  const faceOptions = { withLandmarks: true, withDescriptors: false };
  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  // Make the neural network
  const options = {
    inputs: 68 * 2,
    outputs: 1,
    learningRate: 0.02,
    task:'regression',
    debug: true,
  }
  faceBrain = ml5.neuralNetwork(options);

  // Buttons
  select('#collectData').mousePressed(collectData);
  select('#train').mousePressed(trainModel);

  // Sound
  osc = new p5.Oscillator();
  osc.setType('sine');
}

// Start detecting faces
function faceReady() {
  faceapi.detect(gotFaces);
}

// Got faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
}

// Draw everything
function draw() {
  background(0);

  // Just look at the first face and draw all the points
  if (detections.length > 0) {
    const points = detections[0].landmarks.positions;
    for (let i = 0; i < points.length; i += 1) {
      stroke(161, 95, 251);
      strokeWeight(4);
      point(points[i]._x, points[i]._y);
    }
  }

  // If Collecting  data
  if (collecting) {
    // Get slider frequency value
    const freq = parseFloat(select('#frequency_slider').value());
    select('#training_freq').html(freq);
    osc.freq(freq);

    // Get face inputs
    const inputs = getInputs();
    if (inputs) {
      // Normalize frequency value
      faceBrain.addData(inputs, [freq]);
    }
  }
}

function getInputs() {
  // If there is a face, flatten all the positions into
  // a normalized array.
  if (detections.length > 0) {
    const points = detections[0].landmarks.positions;
    const inputs = [];
    for (let i = 0; i < points.length; i += 1) {
      inputs.push(points[i]._x);
      inputs.push(points[i]._y);
    }
    return inputs;
  }
}
// Start the sound and data collection
function collectData() {
  osc.start();
  osc.amp(5);
  collecting = true;
}

// Train the model
function trainModel() {
  // No longer collecting dataa
  collecting = false;
  osc.amp(0);

  // Normalize face data
  // (You might manually normalize according to width/height if relative canvas position matters)
  faceBrain.normalizeData();
  faceBrain.train({ epochs: 50 }, finishedTraining);
}

// Training is done!
function finishedTraining() {
  console.log('done');
  osc.amp(0.5);
  // Start  predicting
  predict();
}

// Predict a frequency
function predict() {
  const inputs = getInputs();
  faceBrain.predict(inputs, gotFrequency);
}

// Got a result
function gotFrequency(error, outputs) {
  if (error) {
    console.error(error);
    return;
  }
  frequency = outputs[0].value;
  osc.freq(frequency);
  select('#prediction').html(frequency.toFixed(2));
  predict();
}