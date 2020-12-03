// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Object Detection using COCOSSD
This example uses a callback pattern to create the classifier
=== */

let objectDetector;
let img;

function preload() {
  img = loadImage('images/cat.jpg');
  // Models available are 'cocossd', 'yolo'
  objectDetector = ml5.objectDetector('cocossd');
}

function setup() {
  createCanvas(640, 420);
  image(img, 0, 0);
  objectDetector.detect(img, gotResult);
}

// A function to run when we get any errors and the results
function gotResult(err, results) {
  if (err) {
    console.log(err);
  }

  for (let i = 0; i < results.length; i += 1) {
    noStroke();
    fill(0, 255, 0);
    text(
      `${results[i].label} ${nfc(results[i].confidence * 100.0, 2)}%`,
      results[i].x + 5,
      results[i].y + 15,
    );
    noFill();
    strokeWeight(4);
    stroke(0, 255, 0);
    rect(results[i].x, results[i].y, results[i].width, results[i].height);
  }
}
