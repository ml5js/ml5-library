// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

// declare ctx and poses in the global scope
// so that we can access them inside of functions `drawKeypoints()` and `drawSkeleton()`
/** @type {CanvasRenderingContext2D} - the canvas 2d context for drawing. */
let ctx;
/** @type {Array} - the poses detected by the model */
let poses;

async function setup() {
  // Grab elements, create settings, etc.
  const img = document.getElementById("image");

  const canvas = document.getElementById("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const status = document.getElementById("status");

  // Create a new poseNet model
  const poseNet = await ml5.poseNet();
  status.innerText = "Model Loaded!"

  // Detect the poses from our image with single-person detection
  poses = await poseNet.singlePose(img);
  status.innerText = "Pose Detected!";

  // We can call both functions to draw all keypoints and the skeletons
  drawSkeleton();
  drawKeypoints();
}

// Execute the setup function.
setup();

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  poses.forEach(pose => {
    // For each pose detected, loop through all the keypoints
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    pose.pose.keypoints.forEach(keypoint => {
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        // Draw ellipse over part
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#222222";
        ctx.stroke();
        // Line from part to label
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(keypoint.position.x + 4, keypoint.position.y);
        ctx.lineTo(keypoint.position.x + 20, keypoint.position.y);
        ctx.stroke();
        // Write the name of the part
        ctx.textBaseline = "middle";
        ctx.fillText(keypoint.part, keypoint.position.x + 20, keypoint.position.y);
      }
    });
  });
}

// A function to draw the skeletons
function drawSkeleton() {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#FFFFFF";
  // Loop through all the skeletons detected
  poses.forEach(pose => {
    // For every skeleton, loop through all body connections
    pose.skeleton.forEach(connection => {
      // Each connection is an array of two parts
      const [partA, partB] = connection;
      ctx.beginPath();
      ctx.moveTo(partA.position.x, partA.position.y);
      ctx.lineTo(partB.position.x, partB.position.y);
      ctx.stroke();
    });
  });
}
