let img;
let poseNet;

function preload() {
  // load an image for pose detection
  img = loadImage('data/runner.jpg');
}

function setup() {
  createCanvas(img.width, img.height);
  image(img, 0, 0);
  poseNet = ml5.poseNet(modelReady);
}

// when poseNet is ready, do the detection
function modelReady() {
  select('#status').html('Model Loaded');
  // If/When a pose is detected, poseNet.on('pose', ...) will be listening for the detection results 
  poseNet.on('pose', function (poses) {
    select("#status").html('Pose Detected');
    if (poses.length > 0) {
      drawSkeleton(poses);
      drawKeypoints(poses);
    }
  });
  // When the model is ready, run the singlePose() function...
  poseNet.singlePose(img);
}

// The following comes from https://ml5js.org/docs/posenet-webcam
// A function to draw ellipses over the detected keypoints
function drawKeypoints(poses) {
  // Loop through all the poses detected
  poses.forEach(pose => {
    // For each pose detected, loop through all the keypoints
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    pose.pose.keypoints.forEach(keypoint => {
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255);
        stroke(20);
        strokeWeight(4);
        ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
      }
    });
  });
}

// A function to draw the skeletons
function drawSkeleton(poses) {
  // Loop through all the skeletons detected
  poses.forEach(pose => {
    // For every skeleton, loop through all body connections
    pose.skeleton.forEach(connection => {
      // Each connection is an array of two parts
      const [partA, partB] = connection;
      stroke(255);
      strokeWeight(2);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    });
  });
}
