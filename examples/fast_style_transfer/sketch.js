/*
===
Fast Style Transfer Simple Example
===
*/

let net;
let inputImg;
let outputImgData;

function setup() {
  createCanvas(252, 252);
  net = new p5ml.TransformNet(modelLoaded, 'udnie', 'models/udnie/');
}

// A function to be called when the model has been loaded
function modelLoaded() {
  console.log('Model loaded!');

  // Set style for the model
  net.setStyle('udnie');

  inputImg = select('#input-img').elt;

  /**
  * @param inputImg HTMLImageElement of input img
  * @return Array3D containing pixels of output img
  */
  outputImgData = net.predict(inputImg);

  // Show the img on the canvas
  renderToCanvas(outputImgData);
}

function renderToCanvas(outputImgData) {
  const data = outputImgData.dataSync();
  let k = 0;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      k = (i + j * height) * 3;
      let r = Math.round(255 * data[k + 0]);
      let g = Math.round(255 * data[k + 1]);
      let b = Math.round(255 * data[k + 2]);
      let c = color(r, g, b);
      set(i, j, c);
    }
  }
  updatePixels();
}
