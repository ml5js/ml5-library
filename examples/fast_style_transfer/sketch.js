/*
===
Fast Style Transfer Simple Example
===
*/

let net1, net2;
let inputImg;
let outputImgData1, outputImgData2;

function setup() {
  createCanvas(504, 252);
  inputImg = select('#input-img').elt;
  net1 = new p5ml.TransformNet('models/wave', modelLoaded1);
  net2 = new p5ml.TransformNet('models/udnie', modelLoaded2);
}

// A function to be called when the model has been loaded
function modelLoaded1() {
  console.log('Model 1 loaded!');
  /**
  * @param inputImg HTMLImageElement of input img
  * @return Array3D containing pixels of output img
  */
  outputImgData1 = net1.predict(inputImg);

  // Show the img on the canvas
  renderToCanvas1(outputImgData1);
}

function modelLoaded2() {
  console.log('Model 2 loaded!');
  outputImgData2 = net2.predict(inputImg);
  // Show the img on the canvas
  renderToCanvas2(outputImgData2);
}

function renderToCanvas1(outputImgData) {
  const data = outputImgData.dataSync();
  let k = 0;
  for (let i = 0; i < width / 2; i++) {
    for (let j = 0; j < height; j++) {
      k = (i + j * height) * 3;
      let r = floor(256 * data[k + 0]);
      let g = floor(256 * data[k + 1]);
      let b = floor(256 * data[k + 2]);
      let c = color(r, g, b);
      set(i, j, c);
    }
  }
  updatePixels();
}

function renderToCanvas2(outputImgData) {
  const data = outputImgData.dataSync();
  let k = 0;
  for (let i = width / 2; i < width; i++) {
    for (let j = 0; j < height; j++) {
      k = (i + j * height) * 3;
      let r = Math.floor(256 * data[k + 0]);
      let g = Math.floor(256 * data[k + 1]);
      let b = Math.floor(256 * data[k + 2]);
      let c = color(r, g, b);
      set(i, j, c);
    }
  }
  updatePixels();
}
