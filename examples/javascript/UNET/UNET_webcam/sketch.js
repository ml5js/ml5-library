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
const width = 320;
const height = 240;
let request;
let canvas, ctx;

async function setup() {
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext("2d");
  uNet = await ml5.uNet("face");

  // load up your video
  video = document.querySelector("#video");
  // Create a webcam capture
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();

  // Start with a blank image
  segmentationImage = document.querySelector("#segmentationImage");

  // initial segmentation
  uNet.segment(video, gotResult);

  requestAnimationFrame(draw);
}

setup();

function gotResult(error, result) {
  // if there's an error return it
  if (error) {
    console.error(error);
    return;
  }
  // console.log(result)
  // set the result to the global segmentation variable
  segmentationImage = result;

  // Continue asking for a segmentation image
  uNet.segment(video, gotResult);
}

function draw() {
  request = requestAnimationFrame(draw);

  if (Object.prototype.hasOwnProperty.call(segmentationImage, "raw")) {
    // UNET image is 128x128
    const im = imageDataToCanvas(segmentationImage.raw.backgroundMask, 128, 128);
    ctx.drawImage(im, 0, 0, width, height);
  }
}

function imageDataToCanvas(imageData, w, h) {
  // console.log(raws, x, y)
  const arr = Array.from(imageData);
  const canvas = document.createElement("canvas"); // Consider using offScreenCanvas when it is ready?
  const ctx = canvas.getContext("2d");

  canvas.width = w;
  canvas.height = h;

  const imgData = ctx.createImageData(w, h);
  // console.log(imgData)
  const { data } = imgData;

  for (let i = 0; i < w * h * 4; i += 1) data[i] = arr[i];
  ctx.putImageData(imgData, 0, 0);

  return ctx.canvas;
}
