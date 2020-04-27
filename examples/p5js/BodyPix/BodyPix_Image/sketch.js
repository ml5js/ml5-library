let bodypix;
let segmentation;
let img;

function preload() {
  img = loadImage('data/harriet.jpg');
  bodypix = ml5.bodyPix()
}

function setup() {
  createCanvas(480, 560);
  bodypix.segment(img, gotResults)
}

function gotResults(err, result) {
  if (err) {
    console.log(err)
    return
  }

  segmentation = result;

  background(0);
  image(segmentation.backgroundMask, 0, 0, width, height)

}