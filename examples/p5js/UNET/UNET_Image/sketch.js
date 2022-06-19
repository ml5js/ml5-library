// Copyright (c) 2022 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
   ml5 Example
   UNET Image example using p5.js
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

  // load up your image
  img = createImg("assets/test.png", imageReady);
  img.hide();
  
  //create blank image
  segmentationImage = createImage(width, height);
  frameRate(1);
}

function imageReady(){
    console.log('Image ready');

    uNet.segment(img, gotResult);
}

function gotResult(error, result) {
  // if there's an error return it
  if (error) {
    console.error(error);
    return;
  }
  // set the result to the global segmentation variable
  segmentationImage = result.backgroundMask;
}

function draw() {
  background(0)
  image(segmentationImage, 0, 0, width, height);
}