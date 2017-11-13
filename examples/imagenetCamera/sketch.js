/*
===
Simple Image demo
Imagenet with SqueezeNet

Nov 2017
===
*/

let imagenet;
let video;

function preload() {
  // Initialize the imageNet method with the Squeeznet model.
  imagenet = new p5ml.ImageNet('Squeezenet');
}

function setup() {
  video = createCapture(VIDEO);
  createCanvas(640, 480).parent('canvasContainer');
  background(0);
  video.attribute('width', 127);
  video.attribute('height', 127);
  video.hide();
  guess();
}

function guess() {
  // Get a prediction for that image
  imagenet.predict(video.elt, gotResult, 10);
}

function draw() {
  background(0);
  image(video, 0, 0);
}

function gotResult(results) {
  console.log(results);
  // The results are in an array ordered by probability.
  select('#result').html(results[9].label);
  // select('#probability').html(nf(results[9].probability, 0, 5));
  setTimeout(guess, 250);
}
