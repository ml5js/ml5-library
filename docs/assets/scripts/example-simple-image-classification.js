/*
===
Simple Image classification
===
*/

let imagenet;
let img;

function preload() {
  // Initialize the imageNet method with the Squeeznet model.
  imagenet = new p5ml.ImageNet('Squeezenet');
}

function setup() {
  img = createImg('assets/img/kitten.jpg', imageReady);
}

function imageReady() {
  // The image should be 227x227
  img.attribute('width', 227);
  img.attribute('height', 227);
  img.hide();

  // Get a prediction for that image
  imagenet.predict(img.elt, 10, gotResult);
}

// When we get the results
function gotResult(results) {
  // The results are in an array ordered by probability.
  select('#result').html(results[0].label);
  select('#probability').html(nf(results[0].probability, 0, 2));
}
