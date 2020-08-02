let bodypix;
let segmentation;
let img;

function preload() {
  img = loadImage('data/ada.jpg');
  bodypix = ml5.bodyPix();
}

function setup() {
  createCanvas(480, 640);
  bodypix.segment(img, gotResults)
}

function gotResults(err, result) {
  if (err) {
    console.log(err)
    return
  }
  // console.log(result);
  segmentation = result;

  background(0);

  // console.log(segmentation.maskPerson)
  // TODO: image seems to be repeating 4x
  // image(img, 0, 0, width, height)
  image(segmentation.backgroundMask, 0, 0, width, height)

}