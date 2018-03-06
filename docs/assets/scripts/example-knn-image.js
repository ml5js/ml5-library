/*
===
KNN Image Classifier Demo
===
*/

// Set up the video stream
const video = document.getElementById('video');
navigator.getUserMedia({ video: true }, handleVideo, videoError);

function handleVideo(stream) {
  video.src = window.URL.createObjectURL(stream);
}

function videoError() {
  console.error('Video not available');
}

// A function to be called when the model has been loaded
function modelLoaded() {
  document.getElementById('loader').innerText = 'Model loaded!';
}

// Start the KNN Classifier
const knn = new ml5.KNNImageClassifier(modelLoaded, video, 2, 1);

// Train Buttons
document.getElementById('buttonA').onclick = () => train(1);
document.getElementById('buttonB').onclick = () => train(2);

// Reset buttons
document.getElementById('resetA').onclick = () => {
  clearClass(1);
  updateExampleCounts();
};
document.getElementById('resetB').onclick = () => {
  clearClass(2);
  updateExampleCounts();
};

// Predict Button
document.getElementById('predict').onclick = () => predict();

// A function to train the Classifier on a frame from the video.
function train(category) {
  knn.addImage(category);
  updateExampleCounts();
}

// Predict the current frame.
function predict() {
  knn.predict((results) => {
    let msg;

    if (results.classIndex === 1) {
      msg = 'A';
    } else if (results.classIndex === 2) {
      msg = 'B';
    }
    document.getElementById('result').innerText = msg;

    // Update confidence
    document.getElementById('confidenceA').innerText = results.confidences[1];
    document.getElementById('confidenceB').innerText = results.confidences[2];

    setTimeout(() => predict(), 150);
  });
}

// Clear the data in one class
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

// Update the example count for each class
function updateExampleCounts() {
  const counts = knn.getClassExampleCount();
  document.getElementById('exampleA').innerText = counts[1];
  document.getElementById('exampleB').innerText = counts[2];
}
