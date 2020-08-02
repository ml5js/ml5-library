// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let poseNet;
let poses = [];

let video;
let canvas;
let ctx;

async function setup() {
  // Grab elements, create settings, etc.
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });

  video.srcObject = stream;
  video.play();
  // Create a new poseNet method with a single detection
  poseNet = await ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  
  requestAnimationFrame(draw);
}

setup();

function modelReady() {
  console.log('model loaded!')
}


function draw() {
  requestAnimationFrame(draw);
  
  
  ctx.drawImage(video, 0, 0, 640, 480);
  // We can call both functions to draw all keypoints and the skeletons
  

  // For one pose only (use a for loop for multiple poses!)
  if (poses.length > 0) {
    const pose = poses[0].pose;

    // Create a pink ellipse for the nose
    const nose = pose.nose;
    ctx.fillStyle = 'rgb(213, 0, 143)';
    ctx.beginPath();
    ctx.arc(nose.x, nose.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke(); 

    // Create a yellow ellipse for the right eye
    const rightEye = pose.rightEye;
    ctx.fillStyle = 'rgb(255, 215, 0)'
    ctx.beginPath();
    ctx.arc(rightEye.x, rightEye.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke(); 

    // Create a yellow ellipse for the right eye
    const leftEye = pose.leftEye;
    ctx.fillStyle = 'rgb(255, 215, 0)'
    ctx.beginPath();
    ctx.arc(leftEye.x, leftEye.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke(); 
  }
}
