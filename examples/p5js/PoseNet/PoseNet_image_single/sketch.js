let img;
let poseNet;
let poses;

function preload() {
  // load an image for pose detection
  img = loadImage('data/runner.jpg');
}

function setup() {
  createCanvas(img.width, img.height);
  image(img, 0, 0);
  poseNet = ml5.poseNet(modelReady);
  // Do not need to draw on every frame
  noLoop();
}

// when poseNet is ready, do the detection
function modelReady() {
  select('#status').html('Model Loaded');
  // If/When a pose is detected, poseNet.on('pose', ...) will be listening for the detection results 
  poseNet.on('pose', onPose);
  // When the model is ready, run the singlePose() function...
  poseNet.singlePose(img);
}

// Function to run when the model detects poses.
function onPose(result) {
  // Update the status
  select("#status").html('Pose Detected');
  // Store the poses
  poses = result;
  // Initiate the drawing
  redraw();
  // Draw again when changing checkboxes
  select("form").changed(redraw);
}

// p5 draw function
function draw() {
  // Need to reset the canvas by drawing the image again.
  // In order to "undraw" when deselecting checkboxes.
  image(img, 0, 0);

  // If there are no poses, we are done.
  if (!poses) {
    return;
  }

  // Draw the correct layers based on the current checkboxes.
  const showSkeleton = select("#skeleton").checked();
  const showKeypoints = select("#keypoints").checked();
  const showLabels = select("#labels").checked();

  // Loop through all the poses detected
  poses.forEach(pose => {
    // For each pose detected, loop through all body connections on the skeleton
    if (showSkeleton) {
      pose.skeleton.forEach(connection => {
        // Each connection is an array of two parts
        const [partA, partB] = connection;
        // Draw a line between the two parts
        stroke(255);
        strokeWeight(2);
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      });
    }
    // For each pose detected, loop through all the keypoints
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    pose.pose.keypoints.forEach(keypoint => {
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        if (showLabels) {
          // Line from part to label
          stroke(60);
          strokeWeight(1);
          line(keypoint.position.x, keypoint.position.y, keypoint.position.x + 10, keypoint.position.y);
          // Write the name of the part
          textAlign(LEFT, CENTER);
          text(keypoint.part, keypoint.position.x + 10, keypoint.position.y);
        }
        if (showKeypoints) {
          // Draw ellipse over part
          fill(255);
          stroke(20);
          strokeWeight(4);
          ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
        }
      }
    });
  });
}
