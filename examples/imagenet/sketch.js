
let img;
let imagenet;

function preload() {
  img = loadImage('images/elephant.jpg')
}

function setup() {
  var canvas = createCanvas(256, 256);
  pixelDensity(1);
  image(img,0,0,width,height);

  imagenet = new ImageNet(ready);

  function ready() {
    imagenet.inference(canvas.elt);
  }
}
