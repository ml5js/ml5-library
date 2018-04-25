console.log('in crepe');

var capture;
var crepe;

function setup() {
  console.log('in setup');
  createCanvas(390, 240);
  crepe = new ml5.Crepe(getAudioContext());
}

function draw() {
  background(0);
  // image(capture, 0, 0, 320, 240);
  // filter('INVERT');
}

