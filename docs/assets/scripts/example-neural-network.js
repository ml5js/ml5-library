/*
Simple Artificial Neural Network
A simple vanilla 3-layer ANN

Ported from Daniel Shiffman
Nature of Code: Intelligence and Learning
https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

Based on "Make Your Own Neural Network" by Tariq Rashid
https://github.com/makeyourownneuralnetwork/
*/

// Neural Network
var nn;

// Train and Testing Data
var training;
var testing;

// Where are we in the training and testing data
// (for animation)
var trainingIndex = 0;
var testingIndex = 0;

// How many times through all the training data
var epochs = 0;

// Network configuration
var input_nodes = 784;
var hidden_nodes = 256;
var output_nodes = 10;

// Learning rate
var learning_rate = 0.1;

// How is the network doing
var totalCorrect = 0;
var totalGuesses = 0;

// Reporting status to a paragraph
var performanceResult;
var epochsElapsed;

// This is for a user drawn image
var userPixels;
var smaller;
var ux = 16;
var uy = 100;
var uw = 140;

// Load training and testing data
// Note this is not the full dataset
// From: https://pjreddie.com/projects/mnist-in-csv/
function preload() {
  training = loadStrings('assets/data/mnist/mnist_train_10000.csv');
  testing = loadStrings('assets/data/mnist/mnist_test_1000.csv');
}

function setup() {
  // Canvas
  createCanvas(320, 280).parent('canvasContainer');
  pixelDensity(1);

  // Create the neural network
  nn = new p5ml.NeuralNetwork(input_nodes, hidden_nodes, output_nodes, learning_rate);

  // Grab the DOM elements
  performanceResult = select('#performance');
  epochsElapsed = select('#epochs');
  var pauseButton = select('#pause');
  pauseButton.mousePressed(toggle);

  // Toggle the state to start and stop
  function toggle() {
    if (pauseButton.html() === 'pause') {
      noLoop();
      pauseButton.html('continue');
    } else {
      loop();
      pauseButton.html('pause');
    }
  }

  // This button clears the user pixels
  var clearButton = select('#clear');
  clearButton.mousePressed(clearUserPixels);
  // Just draw a black background
  function clearUserPixels() {
    userPixels.background(0);
  }

  // Save the model
  var saveButton = select('#saveModel');
  saveButton.mousePressed(saveModelJSON);
  // Save all the model is a JSON file
  // TODO: add reloading functionality!
  function saveModelJSON() {
    // Take the neural network object and download
    saveJSON(nn, 'model.json');
  }

  // Create a blank user canvas
  userPixels = createGraphics(uw, uw);
  userPixels.background(0);

  // Create a smaller 28x28 image
  smaller = createImage(28, 28, RGB);
  // This is sort of silly, but I'm copying the user pixels
  // so that we see a blank image to start
  var img = userPixels.get();
  smaller.copy(img, 0, 0, uw, uw, 0, 0, smaller.width, smaller.height);
  // frameRate(15);
}

// When the mouse is dragged, draw onto the user pixels
function mouseDragged() {
  // Only if the user drags within the user pixels area
  if (mouseX > ux && mouseY > uy && mouseX < ux + uw && mouseY < uy + uw) {
    // Draw a white circle
    userPixels.fill(255);
    userPixels.stroke(255);
    userPixels.ellipse(mouseX - ux, mouseY - uy, 16, 16);
    // Sample down into the smaller p5.Image object
    var img = userPixels.get();
    smaller.copy(img, 0, 0, uw, uw, 0, 0, smaller.width, smaller.height);
  }
}

function draw() {
  background(200);

  // Train (this does just one image per cycle through draw)
  var traindata = train();

  // Test
  var result = test();
  // The results come back as an array of 3 things
  // Input data
  var testdata = result[0];
  // What was the guess?
  var guess = result[1];
  // Was it correct?
  var correct = result[2];

  // Draw the training and testing image
  drawImage(traindata, ux, 16, 2, 'training');
  drawImage(testdata, 180, 16, 2, 'test');

  // Draw the resulting guess
  fill(0);
  rect(246, 16, 2 * 28, 2 * 28);
  // Was it right or wrong?
  if (correct) {
    fill(0, 255, 0);
  } else {
    fill(255, 0, 0);
  }
  textSize(60);
  text(guess, 258, 64);

  // Tally total correct
  if (correct) {
    totalCorrect++;
  }
  totalGuesses++;

  // Show performance and # of epochs
  var status = nf(totalCorrect / totalGuesses, 0, 2);
  // Percent correct since the sketch began
  var percent = 100 * trainingIndex / training.length;
  var epochsPercent = epochs + ' (' + nf(percent, 1, 2) + '%)';
  performanceResult.html(status);
  epochsElapsed.html(epochsPercent);

  // Draw the user pixels
  image(userPixels, ux, uy);
  fill(0);
  textSize(12);
  text('draw here', ux, uy + uw + 16);
  // Draw the sampled down image
  image(smaller, 180, uy, 28 * 2, 28 * 2);

  // Change the pixels from the user into network inputs
  inputs = [];
  smaller.loadPixels();
  for (var i = 0; i < smaller.pixels.length; i += 4) {
    // Just using the red channel since it's a greyscale image
    // Not so great to use inputs of 0 so smallest value is 0.01
    inputs[i / 4] = map(smaller.pixels[i], 0, 255, 0, 0.99) + 0.01;
  }
  // Get the outputs
  var outputs = nn.query(inputs);
  // What is the best guess?
  var guess = outputs.argMax;

  // Draw the resulting guess
  fill(0);
  rect(246, uy, 2 * 28, 2 * 28);
  fill(255);
  textSize(60);
  text(guess, 258, uy + 48);
}

// Function to train the network
function train() {
  nextTrainingSet = false;
  // Grab a row from the CSV
  var values = training[trainingIndex].split(',');

  // Make an input array to the neural network
  var inputs = [];

  // Starts at index 1
  for (var i = 1; i < values.length; i++) {
    // Normalize the inputs 0-1, not so great to use inputs of 0 so add 0.01
    inputs[i - 1] = map(Number(values[i]), 0, 255, 0, 0.99) + 0.01;
  }

  // Now create an array of targets
  targets = [];
  // Everything by default is wrong
  for (var k = 0; k < output_nodes; k++) {
    targets[k] = 0.01;
  }

  // The first spot is the class
  var label = Number(values[0]);
  // So it should get a 0.99 output
  targets[label] = 0.99;

  // Train with these inputs and targets
  nn.train(inputs, targets);

  // Go to the next training data point
  trainingIndex++;
  if (trainingIndex == training.length) {
    trainingIndex = 0;
    // Once cycle through all training data is one epoch
    epochs++;
  }

  // Return the inputs to draw them
  return inputs;
}

// Function to test the network
function test() {

  // Grab a row from the CSV
  var values = training[testingIndex].split(',');

  // Make an input array to the neural network
  var inputs = [];

  // Starts at index 1
  for (var i = 1; i < values.length; i++) {
    // Normalize the inputs 0-1, not so great to use inputs of 0 so add 0.01
    inputs[i - 1] = map(Number(values[i]), 0, 255, 0, 0.99) + 0.01;
  }

  // The first spot is the class
  var label = Number(values[0]);
  // Run the data through the network
  var outputs = nn.query(inputs);

  // Was the network right or wrong?
  var correct = false;
  var guess = outputs.argMax;

  if (guess == label) {
    correct = true;
  }

  // Switch to a new testing data point every so often
  if (frameCount % 30 == 0) {
    testingIndex++;
    if (testingIndex == testing.length) {
      testingIndex = 0;
    }
  }

  // For reporting in draw return the results
  return [inputs, guess, correct];
}

// Draw the array of floats as an image
function drawImage(values, xoff, yoff, w, txt) {
  // it's a 28 x 28 image
  var dim = 28;

  // For every value
  for (var k = 0; k < values.length; k++) {
    // Scale up to 256
    var brightness = values[k] * 256;
    // Find x and y
    var x = k % dim;
    var y = floor(k / dim);
    // Draw rectangle
    fill(brightness);
    noStroke();
    rect(xoff + x * w, yoff + y * w, w, w);
  }

  // Draw a label below
  fill(0);
  textSize(12);
  text(txt, xoff, yoff + w * 35);
}