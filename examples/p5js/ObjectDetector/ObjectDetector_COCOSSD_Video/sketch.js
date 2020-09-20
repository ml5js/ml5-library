let video;
let detector;
let detections = [];

// Preload the model
function preload() {
  detector = ml5.objectDetector('cocossd');
}

function setup() {
  createCanvas(480, 360);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  // Start detection
  detect();
}

function detect() {
  detector.detect(video, gotResults);
}

// Get results
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // Save results in global variables
  detections = results;
  // Detect again
  detect();
}

function draw() {
  // Draw video
  image(video, 0, 0, width, height);

  // Draw object detections
  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];
    noStroke();
    fill(0, 100);
    rect(object.x, object.y, textWidth(object.label + 4), 24);
    fill(255);
    textSize(16);
    text(object.label, object.x + 4, object.y + 16)
    noFill();
    stroke(0, 255, 0);
    strokeWeight(4);
    rect(object.x, object.y, object.width, object.height);
  }
}