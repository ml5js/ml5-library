// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Real time Object Detection using YOLO and p5.js
=== */

let video;
let yolo;
let status;
let objects = [];

function setup() {
  createCanvas(320, 240);
  video = createCapture(VIDEO);
  video.size(320, 240);

  // Create a YOLO method
  yolo = ml5.YOLO(video, startDetecting);

  // Hide the original video
  video.hide();
  status = select('#status');
}

function draw() {
  image(video, 0, 0, width, height);
  for (let i = 0; i < objects.length; i += 1) {
    noStroke();
    fill(0, 255, 0);
    text(objects[i].label, objects[i].x + 5, objects[i].y + 15);
    noFill();
    strokeWeight(4);
    stroke(0, 255, 0);
    rect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
  }
}

function startDetecting() {
  status.html('Model loaded!');
  detect();
}

function detect() {
  yolo.detect(function(err, results) {
    objects = results;
    detect();
  });
}
