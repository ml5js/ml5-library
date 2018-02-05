/*
===
Fast Style Transfer Simple Example
===
*/

let net1, net2;
let inputImg;
let outputImgData1, outputImgData2;
let outputImg1, outputImg2;

function setup() {
  noCanvas();
  inputImg = select('#input-img').elt;
  net1 = new ml5.TransformNet('models/wave', modelLoaded1);
  net2 = new ml5.TransformNet('models/udnie', modelLoaded2);
}

// A function to be called when the model has been loaded
function modelLoaded1() {
  /**
  * @param inputImg HTMLImageElement of input img
  * @return Array3D containing pixels of output img
  */
  outputImgData1 = net1.predict(inputImg);

  // Convert the Array3D with image data to a html image element
  outputImg1 = ml5.array3DToImage(outputImgData1);
  // Append image to the DOM
  console.log('outputImg1', outputImg1);
  document.body.appendChild(outputImg1);
}

function modelLoaded2() {
  outputImgData2 = net2.predict(inputImg);
  outputImg2 = ml5.array3DToImage(outputImgData2);
  console.log('outputImg2', outputImg2);
  document.body.appendChild(outputImg2);
}
