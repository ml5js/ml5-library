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
let canvas, ctx;

async function make() {
  canvas = createCanvas(200, 200);
  ctx = canvas.getContext('2d');

  dcgan = await ml5.DCGAN('model/geo/manifest.json');

  // Button to generate an image
  // Create a generate button
  button = document.createElement('button');
  button.innerHTML = "generate";
  document.body.appendChild(button);
  button.addEventListener('click', generate);

  // generate an image on load
  generate()
}

// call app.map.init() once the DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
  make();
});

function generate() {
  // Generate function receives a callback for when image is ready
  dcgan.generate(displayImage);
}

function displayImage(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  img = new ImageData(result.raw, 64, 64)
  const canvasElement = document.createElement("canvas"); 
  canvasElement.width  = 64;
  canvasElement.height = 64;
  canvasElement_ctx = canvasElement.getContext('2d');
  canvasElement_ctx.putImageData(img, 0, 0);
  ctx.drawImage(canvasElement, 0, 0, 200, 200);
}

// Helper Functions
function createCanvas(w, h){
  const canvas = document.createElement("canvas"); 
  canvas.width  = w;
  canvas.height = h;
  document.body.appendChild(canvas);
  return canvas;
}