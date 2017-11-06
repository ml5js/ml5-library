
let img;
let imagenet;

function preload() {
  img = loadImage('images/elephant.jpg')
}

function setup() {
  var canvas = createCanvas(512, 512);
  image(img,0,0,width,height);

  imagenet = new ImageNet(ready);

  function ready() {
    imagenet.inference(canvas.elt);    
  }
}

