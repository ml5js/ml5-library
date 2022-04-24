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
let modelReady = false;
let isTransfering = false;

let pX = null;
let pY = null;
let mouseX = null;
let mouseY = null;
let mouseDown = false;

// Create a canvas
const canvas = document.createElement("canvas");
canvas.width = SIZE;
canvas.height = SIZE;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
ctx.fillStyle = '#ebedef'
ctx.fillRect(0, 0, SIZE, SIZE);

// Display initial input image
const inputImg = document.getElementById('inputImage');
const outputImg = document.getElementById('outputImage');
drawImage();

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

// Attach event listeners to the canvas
canvas.addEventListener('mousemove', onMouseUpdate);
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);

// Create a pix2pix method with a pre-trained model
const pix2pix = ml5.pix2pix('models/edges2pikachu.pict', modelLoaded);

requestAnimationFrame(draw);
// drawImage();

// Draw on the canvas when mouse is pressed
function draw() {
  requestAnimationFrame(draw)

  if (pX == null || pY == null) {
    pX = mouseX
    pY = mouseY
    drawImage();
  }

  // drawImage();

  if (mouseDown) {
    // Set stroke weight to 10
    ctx.lineWidth = 10;
    // Set stroke color to black
    ctx.strokeStyle = "#000000";
    // If mouse is pressed, draw line between previous and current mouse positions
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(mouseX, mouseY);
    ctx.lineTo(pX, pY);
    ctx.stroke();
  }


  pX = mouseX
  pY = mouseY
}

// A function to be called when the models have loaded
function modelLoaded() {
  // Show 'Model Loaded!' message
  statusMsg.textContent = 'Model Loaded!';

  // Set modelReady to true
  modelReady = true;

  // Call transfer function after the model is loaded
  transfer();

  // Attach a mousePressed event to the transfer button
  transferBtn.addEventListener('click', () => {
    transfer();
  });
}

// Draw the input image to the canvas
function drawImage() {
  ctx.drawImage(inputImg, 0, 0, SIZE, SIZE);
}

// Clear the canvas
function clearCanvas() {
  ctx.fillStyle = '#ebedef'
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function transfer() {
  // Set isTransfering to true
  isTransfering = true;

  // Update status message
  statusMsg.textContent = 'Applying Style Transfer...!';

  // Apply pix2pix transformation
  pix2pix.transfer(canvas, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result && result.src) {
      // Set isTransfering back to false
      isTransfering = false;
      // Clear output container
      outputContainer.innerHTML = '';
      // Create an image based result
      // createImg(result.src).class('border-box').parent('output');
      outputImg.src = result.src;

      console.log(result);
      // Show 'Done!' message
      statusMsg.textContent = 'Done!';
    }
  });
}


function onMouseDown() {
  mouseDown = true;
}

// Whenever mouse is released, transfer the current image if the model is loaded and it's not in the process of another transformation
function onMouseUp() {
  mouseDown = false;
  if (modelReady && !isTransfering) {
    transfer()
  }
}

function onMouseUpdate(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top
}
