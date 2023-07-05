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

// Declare variables
let startX = null;
let startY = null;
let mouseDown = false;

// Create a canvas
const canvas = document.createElement("canvas");
canvas.width = SIZE;
canvas.height = SIZE;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
// Set stroke weight to 10
ctx.lineWidth = 10;
// Set stroke color to black
ctx.strokeStyle = "#000000";

const rect = canvas.getBoundingClientRect();

// Display initial input image
const inputImg = document.getElementById('inputImage');
const outputImg = document.getElementById('outputImage');
ctx.drawImage(inputImg, 0, 0, SIZE, SIZE);

// Select output div container
const outputContainer = document.getElementById('output');
const statusMsg = document.getElementById('status');

// Select 'transfer' button html element
const transferBtn = document.getElementById('transferBtn');

// Select 'clear' button html element
const clearBtn = document.getElementById('clearBtn');

// Attach a mousePressed event to the 'clear' button
clearBtn.addEventListener('click', () => {
  clearCanvas();
});

// Attach event listeners to the canvas to draw when mouse is pressed
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);

// initialize a pix2pix method with a pre-trained model
const modelPromise = ml5.pix2pix("models/edges2pikachu.pict");

// When the model is loaded...
modelPromise.then(model => {

  // Show 'Model Loaded!' message
  statusMsg.textContent = "Model Loaded!";

  // Call transfer function after the model is loaded
  transfer(model);

  // Attach a mousePressed event to the button
  transferBtn.addEventListener("click", () => {
    transfer(model);
  });

  // Attach another mouseUp event to the canvas
  canvas.addEventListener("mouseup", () => {
    transfer(model);
  });
}).catch(() => {
  // Handle errors
  statusMsg.textContent = "Error loading model.";
});

// Clear the canvas
function clearCanvas() {
  ctx.fillStyle = '#ebedef'
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function transfer(pix2pix) {
  // Update status message
  statusMsg.textContent = "Applying Style Transfer...!";

  // Apply pix2pix transformation
  pix2pix.transfer(canvas).then(result => {
    // Clear output container
    outputContainer.innerHTML = "";
    // Create an image based result
    outputImg.src = result.src;
    // Show 'Done!' message
    statusMsg.textContent = "Done!";
  }).catch(() => {
    // Show error message
    statusMsg.textContent = "Error while transferring image.";
  })
}

// When mouse is pressed, save the start position for drawing a line.
function onMouseDown(e) {
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  mouseDown = true;
}

// Clear coordinates when the mouse is released.
function onMouseUp() {
  mouseDown = false;
  startX = null;
  startY = null;
}

// When moving while the mouse is down, draw line between previous and current mouse positions
function onMouseMove(e) {
  if (mouseDown && startX !== null && startY !== null) {
    // Get current position
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    // Draw line
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(startX, startY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    // Update coordinates for next line.
    startX = currentX;
    startY = currentY;
  }
}
