/*
===
Webcam demo
Imagenet with SqueezeNet

Nov 2017
===
*/

var canvas
var imagenet;
var capture;
var prediction;
var img;

function preload() {
  // Initialize the imageNet method with the Squeeznet model. 
  imagenet = new p5ml.ImageNet('Squeezenet');
}

function setup() {
  canvas = createCanvas(227, 227);

  // Create a video feed
  capture = createCapture(VIDEO);
  capture.size(227, 227);
  pixelDensity(1);

  // This is the img element we are using the classify
  img = select("#img");

  // Decrease the framerate, we don't need 60fps. Although the video will run at 60fps
  frameRate(1)
}

function draw() {
  // Display the video in a canvas. We will be hidding this for now.
  image(capture, 0, 0, 227, 227);

  // Set the pixels from the canvas as img source.
  var frameToPredict = canvas.elt.toDataURL('image/jpg');
  img.elt.src = frameToPredict;

  // Get a prediction for that image
  prediction = imagenet.predict(img.elt, gotResult);

  // When we get the results
  function gotResult(values) {
    // The results are in are inside and object with their corresponding probability
    // Here we are looping over the results and getting the highest one.
    var highestProb = 0;
    var result;
    for (var value in values) {
      if (values[value] > highestProb) {
        highestProb = values[value];
        result = value;
      }
    }
    select('#result').html(result);
    // We are still console loggin all the results
    console.log(values)
  }
}