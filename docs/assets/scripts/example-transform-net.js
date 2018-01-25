/*
===
Fast Style Transfer Simple Example
===
*/

// Two Fast Style Transfer styles
let fst1;
let fst2;

let inputImg;
let outputOne;
let outputTwo;

function setup() {
  noCanvas();
  inputImg = select('#inputImg').elt;
  outputOne = select('#resultImgOne').elt;
  outputTwo = select('#resultImgTwo').elt;
  fst1 = new p5ml.TransformNet('assets/models/wave', loadedModelOne);
  fst2 = new p5ml.TransformNet('assets/models/udnie', loadedModelTwo);
}

// A function to be called when the first model has been loaded
function loadedModelOne() {
  const result = fst1.predict(inputImg);
  // Convert the Array3D with image data to a html image element
  const resultImg = p5ml.array3DToImage(result);
  // Show img
  outputOne.append(resultImg);
}

// A function to be called when the first model has been loaded
function loadedModelTwo() {
  const result = fst2.predict(inputImg);
  // Convert the Array3D with image data to a html image element
  const resultImg = p5ml.array3DToImage(result);
  // Show img
  outputTwo.append(resultImg);
}
