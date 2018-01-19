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
  createCanvas(504, 252);
  inputImg = select('#input-img').elt;
  net1 = new p5ml.TransformNet('models/wave', modelLoaded1);
  net2 = new p5ml.TransformNet('models/udnie', modelLoaded2);
}

// A function to be called when the model has been loaded
function modelLoaded1() {
  /**
  * @param inputImg HTMLImageElement of input img
  * @return Array3D containing pixels of output img
  */
  outputImgData1 = net1.predict(inputImg);

  // Convert the Array3D with image data to a p5.Image
  outputImg1 = array3DToP5Image(outputImgData1);
  // Draw the p5.Image on the canvas
  image(outputImg1, 0, 0);
}

function modelLoaded2() {
  outputImgData2 = net2.predict(inputImg);
  outputImg2 = array3DToP5Image(outputImgData2);
  image(outputImg2, width / 2, 0);
}

/**
* @param imgData Array3D containing pixels of a img
* @return p5 Image
*/
function array3DToP5Image(imgData) {  
  const imgWidth = imgData.shape[0];
  const imgHeight = imgData.shape[1];
  const data = imgData.dataSync();
  let outputImg = createImage(imgWidth, imgHeight);
  outputImg.loadPixels();
  let k = 0;
  for (let i = 0; i < outputImg.width; i++) {
    for (let j = 0; j < outputImg.height; j++) {
      k = (i + j * height) * 3;
      let r = floor(256 * data[k + 0]);
      let g = floor(256 * data[k + 1]);
      let b = floor(256 * data[k + 2]);
      let c = color(r, g, b);
      outputImg.set(i, j, c);
    }
  }
  outputImg.updatePixels();
  return outputImg;
}
