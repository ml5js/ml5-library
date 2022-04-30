// The neural network is the brain
let brain;

// Variables to track p5 oscillator
let frequency;
let osc;

function setup() {
  const canvas = createCanvas(400, 400);
  // Only when clicking on the canvas
  canvas.mousePressed(addData);

  // Create ethe model
  const options = {
    inputs: ['x', 'y'],  // TODO: support ['x', 'y']
    outputs: ['freq'], // TODO: support ['freq]
    task:'regression',
    debug: true,
  }
  brain = ml5.neuralNetwork(options);

  // Train Model button
  select('#train').mousePressed(trainModel);

  background(0);
}

// Add a data record
function addData() {
  // Get frequency
  const target = parseFloat(select('#frequency').value());
  // TODO: support notePlayer.data.addData({x: mouseX, y: mouseY}, {frequency: target});
  // Add data
  brain.addData({x:mouseX, y:mouseY}, {freq:target});

  // Draw circle to visualize training data
  stroke(255);
  noFill();
  ellipse(mouseX, mouseY, 32);
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(target, mouseX, mouseY);
}

// Train the model
function trainModel() {
  // ml5 will normalize data to a range between 0 and 1 for you.
  brain.normalizeData();
  // Train the model
  // Epochs: one cycle through all the training data
  brain.train({ epochs: 20 }, finishedTraining);
}

// When the model is trained
function finishedTraining() {
  // Start playing sound
  osc = new p5.Oscillator();
  osc.setType('sine');
  osc.amp(0.5);
  osc.freq(440);
  osc.start();

  // Predict a frequency
  brain.predict([mouseX, mouseY], gotFrequency);
}

// Got a result
function gotFrequency(error, outputs) {
  if (error) {
    console.error(error);
    return;
  }

  // The output comes in an array
  // There is only one output in this example, but it could be more!
  frequency = parseFloat(outputs[0].value);

  // Render frequency value
  select('#prediction').html(frequency.toFixed(2));

  // Adjust oscillator
  osc.freq(parseFloat(frequency));

  // Predict again
  brain.predict([mouseX, mouseY], gotFrequency);
}

