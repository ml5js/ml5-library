/*
===
Video Classification
===
*/

// Initialize the imageNet method with the MobileNet model.
const imagenet = new ml5.ImageNet('MobileNet');

// Set up the video stream
const video = document.getElementById('video');
navigator.getUserMedia({ video: true }, handleVideo, videoError);

function handleVideo(stream) {
  video.src = window.URL.createObjectURL(stream);
  guess(); // Once the video is set up, start predicting
}

function videoError(err){
  console.error('Video not available');
}

// Get a prediction for that image
function guess() {
  imagenet.predict(video, 10, gotResult);
}

// When we get the results
function gotResult(results) {
  const result = document.getElementById('result');
  const probability = document.getElementById('probability');
  result.innerText = results[0].label;
  probability.innerText = results[0].probability.toFixed(2);
  setTimeout(guess, 250);
}
