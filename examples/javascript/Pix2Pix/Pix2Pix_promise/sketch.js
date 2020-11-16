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
let inputImg, canvas, outputContainer, statusMsg, pix2pix, clearBtn, transferBtn;
const mouseIsPressed = false;
let outputImg;

let pX = null;
let pY = null;
let mouseX = null;
let mouseY = null;
let mouseDown = false;

async function setup() {
  // Create a canvas
  canvas = createCanvas(SIZE, SIZE);

  // Display initial input image
  inputImg = document.querySelector("#inputImage");
  outputImg = document.querySelector("#outputImage");

  // Selcect output div container
  outputContainer = document.querySelector("#output");
  statusMsg = document.querySelector("#status");

  // Select 'transfer' button html element
  transferBtn = document.querySelector("#transferBtn");

  // Select 'clear' button html element
  clearBtn = document.querySelector("#clearBtn");

  // Attach a mousePressed event to the 'clear' button
  clearBtn.addEventListener("click", () => {
    clearCanvas();
  });

  document.querySelector("canvas").addEventListener("mousemove", onMouseUpdate);
  document.querySelector("canvas").addEventListener("mousedown", onMouseDown);
  document.querySelector("canvas").addEventListener("mouseup", onMouseUp);

  requestAnimationFrame(draw);
}

setup();

// Draw on the canvas when mouse is pressed
function draw() {
  requestAnimationFrame(draw);

  if (pX == null || pY == null) {
    pX = mouseX;
    pY = mouseY;
    drawImage();
  }

  if (mouseDown) {
    // Set stroke weight to 10
    canvas.lineWidth = 10;
    // Set stroke color to black
    canvas.strokeStyle = "#000000";
    // If mouse is pressed, draw line between previous and current mouse positions
    canvas.beginPath();
    canvas.lineCap = "round";
    canvas.moveTo(mouseX, mouseY);
    canvas.lineTo(pX, pY);
    canvas.stroke();
  }

  pX = mouseX;
  pY = mouseY;
}

// Draw the input image to the canvas
function drawImage() {
  canvas.drawImage(inputImg, 0, 0, SIZE, SIZE);

  // After input image is loaded, initialize a pix2pix method with a pre-trained model
  ml5.pix2pix("models/edges2pikachu.pict").then(model => {
    // Show 'Model Loaded!' message
    statusMsg.textContent = "Model Loaded!";

    // Call transfer function after the model is loaded
    transfer(model);

    // Attach a mousePressed event to the button
    transferBtn.addEventListener("click", function() {
      transfer(model);
    });
  });
}

// Clear the canvas
function clearCanvas() {
  canvas.fillStyle = "#ebedef";
  canvas.fillRect(0, 0, SIZE, SIZE);
}

function transfer(pix2pix) {
  // Update status message
  statusMsg.textContent = "Applying Style Transfer...!";

  // Select canvas DOM element
  const canvasElement = document.querySelector("canvas");

  // Apply pix2pix transformation
  pix2pix.transfer(canvasElement).then(result => {
    // Clear output container
    outputContainer.innerHTML = "";
    // Create an image based result
    outputImg.src = result.src;
    // Show 'Done!' message
    statusMsg.textContent = "Done!";
  });
}

function createCanvas(w, h) {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = w;
  canvasElement.height = h;
  document.body.appendChild(canvasElement);
  const canvas = canvasElement.getContext("2d");
  canvas.fillStyle = "#ebedef";
  canvas.fillRect(0, 0, w, h);
  return canvas;
}

function onMouseDown(e) {
  mouseDown = true;
}

function onMouseUp(e) {
  mouseDown = false;
}

function onMouseUpdate(e) {
  const pos = getMousePos(document.querySelector("canvas"), e);
  mouseX = pos.x;
  mouseY = pos.y;
}

function getMousePos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
