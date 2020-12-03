let cartoonGAN;
let video;
let cartoonImg;

function preload() {
  cartoonGAN = ml5.cartoon();
}

function setup() {
  createCanvas(320, 240);
  video = createCapture(VIDEO, videoReady);
  video.size(320, 240);
}

function videoReady() {
  cartoonGAN.generate(video, gotResults);
}

function draw() {
  background(0);
  if (cartoonImg) {
    image(cartoonImg, 0, 0, width, height);
  }
}

function gotResults(error, result) {
  if (error) {
    console.error(error);
    return;
  }
  cartoonImg = result.image;
  cartoonGAN.generate(video, gotResults);
}
