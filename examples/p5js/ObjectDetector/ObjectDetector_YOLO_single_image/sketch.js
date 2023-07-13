/* ===
ml5 Example
Object Detection using YOLO
=== */

let objects = [];
let objectDetector;
let img;

// Load the image before the main program starts.
function preload() {
  img = loadImage("images/cat2.JPG");
}

function setup() {
  // Create a canvas that's the size of the image.
  createCanvas(img.width, img.height);
  // Draw the image to the canvas.
  image(img, 0, 0);
  // Create the model and call modelReady() when it is loaded.
  // Models available are 'cocossd', 'yolo'.
  objectDetector = ml5.objectDetector("yolo", modelReady);
}

// When the model is ready, do the detection.
function modelReady() {
  console.log("Model ready!");
  objectDetector.detect(img, gotResult);
}

// A function to run when we get any errors and the results
function gotResult(err, results) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(results);
  // Assign the results to the global `objects` variable to be used in draw().
  objects = results;
}

function draw() {
  // Check that we have results.
  if (objects.length > 0) {
    for (let i = 0; i < objects.length; i += 1) {
      noStroke();
      fill(0, 255, 0);
      text(
        `${objects[i].label} ${nfc(objects[i].confidence * 100.0, 2)}%`,
        objects[i].x + 5,
        objects[i].y + 15,
      );
      noFill();
      strokeWeight(4);
      stroke(0, 255, 0);
      rect(
        objects[i].x,
        objects[i].y,
        objects[i].width,
        objects[i].height,
      );
    }
    noLoop(); // Stops the p5 loop so that draw() won't be called again.
  }
}
