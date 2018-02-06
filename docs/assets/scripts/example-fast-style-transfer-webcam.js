/*
===
Fast Style Transfer Mirror Example
===
*/

let net;
let outputImgData;
let outputImg;
let outputImgContainer;
let video;
let modelReady = false;
let startPredict = false;

function setup() {
  noCanvas();
  video = createCapture(VIDEO);
  video.size(200, 200);
  video.hide();
  net = new ml5.TransformNet('assets/models/udnie', modelLoaded);
  outputImgContainer = createImg('assets/img/udnie.jpg', 'image');
  outputImgContainer.parent('output-container');
}

function draw() {
  if (startPredict && modelReady) {
    predict();
  }
}

function modelLoaded() {
  modelReady = true;
}

function togglePredicting() {
  startPredict = !startPredict;
}

function predict() {
  outputImgData = net.predict(video.elt);
  outputImg = ml5.array3DToImage(outputImgData);
  outputImgContainer.elt.src = outputImg.src;
}
