// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
DCGAN example
=== */

let dcgan;

const vector = [];

function preload() {
  dcgan = ml5.DCGAN('model/geo/manifest.json');
}

function setup() {
  createCanvas(600, 600);

  // start with random vector
  for (let i = 0; i < 128; i += 1) {
    vector[i] = random(-1, 1);
  }

  // generate an image on load
  generate();
}


function walk() {
  for (let i = 0; i < 128; i += 1) {
    vector[i] += random(-0.01, 0.01);
  }
}

function generate() {
  walk();
  dcgan.generate(displayImage, vector);
}

function displayImage(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  image(result.image, 0, 0, width, height);
  generate();
}