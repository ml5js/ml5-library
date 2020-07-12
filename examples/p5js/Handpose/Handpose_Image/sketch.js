let handpose;
let predictions = [];
let img;

function setup() {
  // Create a canvas that's at least the size of the image.
  createCanvas(400, 350);

  // create an image using the p5 dom library
  // call modelReady() when it is loaded
  img = createImg("data/hand.jpg", imageReady);

  img.hide(); // hide the image in the browser
  frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
}

// when the image is ready, then load up poseNet
function imageReady() {
  handpose = ml5.handpose(img, modelReady);

  handpose.on("predict", results => {
    predictions = results;
  });
}

// when poseNet is ready, do the detection
function modelReady() {
  console.log("Model ready!");
  handpose.predict(img);
}

// draw() will not show anything until poses are found
function draw() {
  if (predictions.length > 0) {
    image(img, 0, 0, width, height);
    drawKeypoints();
    noLoop(); // stop looping when the poses are estimated
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 10, 10);
    }
  }
}