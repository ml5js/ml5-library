// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

// declare img, ctx and poses in the global scope
// so that we can access them inside of the `draw()` function
/** @type {HTMLImageElement} - the input image. */
let img;
/** @type {CanvasRenderingContext2D} - the canvas 2d context for drawing. */
let ctx;
/** @type {Array} - the poses detected by the model */
let poses;

async function setup() {
  // Grab elements, create settings, etc.
  img = document.getElementById("image");

  const canvas = document.getElementById("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  // Create a new poseNet model
  const poseNet = await ml5.poseNet();
  const status = document.getElementById("status");
  status.innerText = "Model Loaded!"

  // Detect the poses from our image with single-person detection
  poses = await poseNet.singlePose(img);
  status.innerText = "Pose Detected!";

  // Draw the results
  draw();

  // Draw again when changing checkboxes
  const form = document.querySelector("form");
  form.addEventListener("change", draw);
}

// Execute the setup function.
setup();

function draw() {
  // Need to reset the canvas by drawing the image again.
  // In order to "undraw" when deselecting checkboxes.
  ctx.drawImage(img, 0, 0, img.width, img.height);

  // Draw the correct layers based on the current checkboxes.
  const showSkeleton = document.getElementById("skeleton").checked;
  const showKeypoints = document.getElementById("keypoints").checked;
  const showLabels = document.getElementById("labels").checked;

  // Loop through all the poses detected
  poses.forEach(pose => {
    // For each pose detected, loop through all body connections on the skeleton
    if (showSkeleton) {
      // Set drawing styles
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      pose.skeleton.forEach(connection => {
        // Each connection is an array of two parts
        const [partA, partB] = connection;
        // Draw a line between the two parts
        ctx.beginPath();
        ctx.moveTo(partA.position.x, partA.position.y);
        ctx.lineTo(partB.position.x, partB.position.y);
        ctx.stroke();
      });
    }
    // For each pose detected, loop through all the keypoints
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    pose.pose.keypoints.forEach(keypoint => {
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        // Set drawing styles
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#222222";
        if (showLabels) {
          // Line from part to label
          ctx.beginPath();
          ctx.moveTo(keypoint.position.x, keypoint.position.y);
          ctx.lineTo(keypoint.position.x + 20, keypoint.position.y);
          ctx.lineWidth = 1;
          ctx.stroke();
          // Write the name of the part
          ctx.textBaseline = "middle";
          ctx.fillText(keypoint.part, keypoint.position.x + 20, keypoint.position.y);
        }
        if (showKeypoints) {
          // Draw ellipse over part
          ctx.beginPath();
          ctx.arc(keypoint.position.x, keypoint.position.y, 4, 0, 2 * Math.PI);
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }
    });
  });
}
