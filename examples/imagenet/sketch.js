
let img;
let imagenet;

function preload() {
  img = createImg('images/elephant.jpg')
}

function setup() {
  var canvas = createCanvas(600, 400);
  image(img,0,0,width,height);

  imagenet = new ImageNet();
  imagenet.inference(img);


}
