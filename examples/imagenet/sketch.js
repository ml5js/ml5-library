/*
===
Simple Image demo
Imagenet with SqueezeNet

Nov 2017
===
*/

let imagenet;
let img;

function preload() {
  // Initialize the imageNet method with the Squeeznet model.
  imagenet = new p5ml.ImageNet('Squeezenet');
}

function setup() {
  img = createImg('images/kitten.jpg', imageReady);
  createCanvas(320, 240);
}

function imageReady() {
  img.attribute('width', 227)
  img.attribute('height', 227)
  img.hide();

  createCanvas(320, 240);
  background(0);
  image(img, 0, 0, width, height);

  // Get a prediction for that image
  let prediction = imagenet.predict(img.elt, gotResult, 10);

  // When we get the results
  function gotResult(results) {
    console.log(results);
    // The results are in an array ordered by probability.
    select('#result').html(results[0].label);
    select('#probability').html(nf(results[0].probability, 0, 2));
  }
}
