// The neural network is the brain
let brain;

function setup() {
  const canvas = createCanvas(400, 400);
  // Only when clicking on the canvas
  canvas.mousePressed(addData);

  // Create ethe model
  const options = {
    inputs: ['x', 'y'],  // TODO: support ['x', 'y']
    outputs: ['label'], // TODO: support ['label']
    debug: true,
    task: 'classification'
  }
  brain = ml5.neuralNetwork(options);

  // Train Model button
  select('#train').mousePressed(trainModel);

  background(0);
}

// Add a data record
function addData() {
  // Get frequency
  const label = select('#label').value();
  // Add data
  brain.addData({x:mouseX, y:mouseY}, {label});

  // Draw circle to visualize training data
  stroke(255);
  noFill();
  ellipse(mouseX, mouseY, 32);
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(label, mouseX, mouseY);
}

// Train the model
function trainModel() {
  // ml5 will normalize data to a range between 0 and 1 for you.
  brain.normalizeData();
  // Train the model
  // Epochs: one cycle through all the training data
  brain.train({ epochs: 50 }, finishedTraining);
}

// When the model is trained
function finishedTraining() {
  brain.classify({x:mouseX,y: mouseY}, gotResults);
}

// Got a result
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  // console.log(results)
  // Show classification
  select('#classification').html(results[0].label);

  // Predict again
  brain.classify({x:mouseX,y: mouseY}, gotResults);
}

