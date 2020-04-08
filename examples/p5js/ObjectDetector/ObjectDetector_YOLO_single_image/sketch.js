let objectDetector;
let img;
let objects = [];
let status;

function preload(){
  img = loadImage('images/cat2.JPG');
}


function setup() {
  createCanvas(640, 420);

  objectDetector = ml5.objectDetector('yolo', modelReady);

}

// Change the status when the model loads.
function modelReady() {
  console.log("model Ready!")
  status = true;
  console.log('Detecting') 
  objectDetector.detect(img, gotResult);
}

// A function to run when we get any errors and the results
function gotResult(err, results) {
  if (err) {
    console.log(err);
  }
  console.log(results)
  objects = results;
}


function draw() {
  // unless the model is loaded, do not draw anything to canvas
  if (status != undefined) {
    image(img, 0, 0)

    for (let i = 0; i < objects.length; i++) {
      noStroke();
      fill(0, 255, 0);
      text(objects[i].label + " " + nfc(objects[i].confidence * 100.0, 2) + "%", objects[i].x + 5, objects[i].y + 15);
      noFill();
      strokeWeight(4);
      stroke(0, 255, 0);
      rect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
    }
  }
}