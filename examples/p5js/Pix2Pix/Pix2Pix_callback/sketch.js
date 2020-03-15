// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Pix2pix Edges2Pikachu example with p5.js using callback functions
This uses a pre-trained model on Pikachu images
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/pix2pix
=== */

// The pre-trained Edges2Pikachu model is trained on 256x256 images
// So the input images can only be 256x256 or 512x512, or multiple of 256
const SIZE = 256;
let inputImg, inputCanvas, outputContainer, statusMsg, pix2pix, clearBtn, transferBtn, modelReady = false, isTransfering = false;

function setup() {
  // Create a canvas
  inputCanvas = createCanvas(SIZE, SIZE);
  inputCanvas.class('border-box').parent('canvasContainer');

  // Display initial input image
  inputImg = loadImage('images/input.png', drawImage);

  // Selcect output div container
  outputContainer = select('#output');
  statusMsg = select('#status');

  // Select 'transfer' button html element
  transferBtn = select('#transferBtn');

  // Select 'clear' button html element
  clearBtn = select('#clearBtn');
  // Attach a mousePressed event to the 'clear' button
  clearBtn.mousePressed(function() {
    clearCanvas();
  });

  // Set stroke to black
  stroke(0);
  pixelDensity(1);

  // Create a pix2pix method with a pre-trained model
  pix2pix = ml5.pix2pix('models/edges2pikachu.pict', modelLoaded);
}

// Draw on the canvas when mouse is pressed
function draw() {
  if (mouseIsPressed) {
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

// Whenever mouse is released, transfer the current image if the model is loaded and it's not in the process of another transformation
function mouseReleased() {
  if (modelReady && !isTransfering) {
    transfer()
  }
}

// A function to be called when the models have loaded
function modelLoaded() {
  // Show 'Model Loaded!' message
  statusMsg.html('Model Loaded!');

  // Set modelReady to true
  modelReady = true;

  // Call transfer function after the model is loaded
  transfer();

  // Attach a mousePressed event to the transfer button
  transferBtn.mousePressed(function() {
    transfer();
  });
}

// Draw the input image to the canvas
function drawImage() {
  image(inputImg, 0, 0);
}

// Clear the canvas
function clearCanvas() {
  background(255);
}

function transfer() {
  // Set isTransfering to true
  isTransfering = true;

  // Update status message
  statusMsg.html('Applying Style Transfer...!');

  // Select canvas DOM element
  const canvasElement = select('canvas').elt;

  // Apply pix2pix transformation
  pix2pix.transfer(canvasElement, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result && result.src) {
      // Set isTransfering back to false
      isTransfering = false;
      // Clear output container
      outputContainer.html('');
      // Create an image based result
      createImg(result.src).class('border-box').parent('output');
      // Show 'Done!' message
      statusMsg.html('Done!');
    }
  });
}
