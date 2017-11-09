/*
===
Imagenet with SqueezeNet 

Simple Image demo
Nov 2017
===
*/

var imagenet;
var img
var prediction;

function preload() {
  // Initialize the imageNet method with the Squeeznet model. 
  imagenet = new p5ml.ImageNet('Squeezenet');
}

function setup() {
  // Get the image from the DOM
  img = select('#img');

  //Get a prediction for that image
  prediction = imagenet.predict(img.elt, gotResult);
  
  // When we get the results
  function gotResult(values){
    // The results are in are inside and object with their corresponding probability
    // Here we are looping over the results and getting the highest one.
    var highestProb = 0;
    var result;
    for (var value in values){
      if(values[value] > highestProb){
        highestProb = values[value];
        result = value;
      }
    }
    select('#result').html("I guess this is a " + result);
    // We are still console loggin all the results
    console.log(values)
  }
}
