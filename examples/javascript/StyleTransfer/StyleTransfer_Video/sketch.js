// Copyright (c) 2019 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Style Transfer Mirror Example using p5.js
This uses a pre-trained model of The Great Wave off Kanagawa and Udnie (Young American Girl, The Dance)
=== */

let style;
let video;
let isTransferring = false;
let resultImg;
let canvas, ctx;
let toggleButton;
const width = 320;
const height = 240;

async function setup() {
  canvas = createCanvas(width, height);
  ctx = canvas.getContext('2d');

  video = await getVideo();
  

  // The results image from the style transfer
  resultImg = document.querySelector('#myImage');

  // The button to start and stop the transfer process
  toggleButton = document.querySelector('#startStop');
  toggleButton.addEventListener('click', startStop)

  // Create a new Style Transfer method with a defined style.
  // We give the video as the second argument
  style = await ml5.styleTransfer('models/udnie', video, modelLoaded);

  requestAnimationFrame(draw);
}

setup();

function draw(){
  requestAnimationFrame(draw);
  // Switch between showing the raw camera or the style
  if (isTransferring) {
    ctx.drawImage(resultImg, 0, 0, 320, 240);
  } else {
    ctx.drawImage(video, 0, 0, 320, 240);
  }
}

// A function to call when the model has been loaded.
function modelLoaded() {
  document.querySelector('#status').innerHTML = 'Model Loaded';
}

// Start and stop the transfer process
function startStop() {
  if (isTransferring) {
    toggleButton.innerHTML = 'Start';
  } else {
    toggleButton.innerHTML = 'Stop';
    // Make a transfer using the video
    style.transfer(gotResult); 
  }
  isTransferring = !isTransferring;
}

// When we get the results, update the result image src
function gotResult(err, img) {
  resultImg.setAttribute('src', img.src);
  if (isTransferring) {
    style.transfer(gotResult); 
  }
}

// Helper Functions
async function getVideo() {
  // Grab elements, create settings, etc.
  const videoElement = document.createElement('video');
  videoElement.setAttribute("style", "display: inline-block;");
  videoElement.width = width;
  videoElement.height = height;
  document.body.appendChild(videoElement);

  // Create a webcam capture
  const capture = await navigator.mediaDevices.getUserMedia({
    video: true
  })
  videoElement.srcObject = capture;
  videoElement.play();

  return videoElement
}


// Helper Functions
function createCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  document.body.appendChild(canvasElement);
  return canvas;
}