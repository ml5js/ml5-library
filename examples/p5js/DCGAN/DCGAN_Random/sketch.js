// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
DCGAN example
=== */

let dcgan;
let button;

function preload(){

  dcgan = ml5.DCGAN('model/geo/manifest.json');

}

function setup() {
  createCanvas(200, 200);
  // Button to generate an image
  button = createButton('generate');
  button.mousePressed(generate);

  // generate an image on load
  generate()
}

function generate() {
  // Generate function receives a callback for when image is ready
  dcgan.generate(displayImage);
}

function displayImage(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  image(result.image, 0, 0, 200, 200);
}
