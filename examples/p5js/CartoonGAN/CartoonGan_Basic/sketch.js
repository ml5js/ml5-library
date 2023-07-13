let cartoonGan;
let img;

function preload() {
  img = loadImage('MrBubz.jpg');
}

function setup() {
  createCanvas(160, 160);

  cartoonGan = ml5.cartoon(modelLoaded);
  image(img, 0, 0, width, height);
}

function modelLoaded() {
  cartoonGan.generate(img, gotResults);
}

function gotResults(err, result) {
  if (err) {
    return;
  }
  console.log(result);
  image(result.image, 0, 0, width, height);
}

