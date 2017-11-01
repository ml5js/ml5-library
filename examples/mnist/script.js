/*
===
Mnist Demo
deeplearn.js meets p5

This is a port of Daniel Shiffman Nature of Code: Intelligence and Learning
Original Repo: https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

Cristóbal Valenzuela
https://github.com/cvalenzuela/p5deeplearn
===
*/

var submit; // Submit button
var resultP; // Show results

var next = false;
var drawing = false;

function setup() {
  // Create DOM elements
  var canvas = createCanvas(200, 200);
  pixelDensity(1);
  canvas.mousePressed(startDrawing);
  canvas.mouseReleased(stopDrawing);
  resultP = createP(' ');
  submit = createButton('classify');
  // When the button is pressed classify!
  submit.mousePressed(classify);
  background(0);
}

// Turn drawing on
function startDrawing() {
  drawing = true;
  if (next) {
    // Clear the background
    background(0);
    next = false;
  }
}

// Turn drawing off when you release
function stopDrawing() {
  drawing = false;
}

function draw() {
  // If you are drawing
  if (drawing) {
    stroke(235);
    strokeWeight(20);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

// Run the classification
function classify() {
  var img = createImage(28, 28);
  var gray = [];

  img.copy(get(), 0, 0, width, height, 0, 0, 28, 28);
  img.loadPixels();
  var imgPixels = Array.prototype.slice.call(img.pixels);

  for (var i = 0; i < 784; i++) {
    var value = imgPixels.slice(0, 3).reduce(function(sum, current) {
      return sum + current
    }) / 3
    gray.push(float(norm(value, 0, 255).toFixed(3)))
    imgPixels.splice(0, 4)
  }
  next = true;

  predict(gray);

  // Debug: Draw the greyscale 28x28 image in the corner
  //copy(img.get(),0,0,28,28,0,0,28,28)  

}

// Where the magic happens
var data, graphModel, session, input, probs;
var math = new deeplearn.NDArrayMathGPU();

var reader = new deeplearn.CheckpointLoader('../../../models/mnist/');
reader.getAllVariables().then(function(checkpoints) {
  graphModel = buildModelGraph(checkpoints);
  input = graphModel[0];
  probs = graphModel[1];
  session = new deeplearn.Session(input.node.graph, math);
});

function predict(data) {
  math.scope(function(keep, track) {
    var inputData = track(deeplearn.Array1D.new(data));
    var probsVal = session.eval(probs, [{ tensor: input, data: inputData }]);
    console.log('Prediction: ' + probsVal.get());
    resultP.html('Prediction: ' + probsVal.get());
  });
};

function buildModelGraph(checkpoints) {
  var g = new deeplearn.Graph();
  var input = g.placeholder('input', [784]);
  var hidden1W = g.constant(checkpoints['hidden1/weights']);
  var hidden1B = g.constant(checkpoints['hidden1/biases']);
  var hidden1 = g.relu(g.add(g.matmul(input, hidden1W), hidden1B));
  var hidden2W = g.constant(checkpoints['hidden2/weights']);
  var hidden2B = g.constant(checkpoints['hidden2/biases']);
  var hidden2 = g.relu(g.add(g.matmul(hidden1, hidden2W), hidden2B));
  var softmaxW = g.constant(checkpoints['softmax_linear/weights']);
  var softmaxB = g.constant(checkpoints['softmax_linear/biases']);
  var logits = g.add(g.matmul(hidden2, softmaxW), softmaxB);
  return [input, g.argmax(logits)];
}