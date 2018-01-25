/*
===
Video Classification
===
*/

let imagenet;
let video;

function preload() {
  // Initialize the imageNet method with the Squeeznet model.
  imagenet = new p5ml.ImageNet('Squeezenet');
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  video = createCapture(VIDEO);
  background(0);
  video.attribute('width', 127);
  video.attribute('height', 127);
  video.hide();
  guess();
}

function guess() {
  // Get a prediction for that image
  imagenet.predict(video.elt, 10, gotResult);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
}

function gotResult(results) {
  // The results are in an array ordered by probability.
  select('#result').html(results[0].label);
  select('#probability').html(nf(results[0].probability, 0, 2));
  setTimeout(guess, 250);
}
