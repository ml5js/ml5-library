// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
UNET example using p5.js
=== */

let video;
let uNet;
let segmentationImage;

// load uNet model
function preload() {
  uNet = ml5.uNet('face');
}

function setup() {
  createCanvas(320, 240);

  // load up your video
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video element, and just show the canvas

  // Start with a blank image
  segmentationImage = createImage(width, height);

  // initial segmentation
  uNet.segment(video, gotResult);
}

function gotResult(error, result) {
  // if there's an error return it
  if (error) {
    console.error(error);
    return;
  }
  // set the result to the global segmentation variable
  segmentationImage = result.backgroundMask;

  // Continue asking for a segmentation image
  uNet.segment(video, gotResult);
}

function draw() {
  background(0)
  image(segmentationImage, 0, 0, width, height);
}
