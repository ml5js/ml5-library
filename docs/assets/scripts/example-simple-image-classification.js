/*
===
Simple Image classification
===
*/

// Initialize the imageNet method with the MobileNet model.
const imagenet = new ml5.ImageNet('MobileNet');

// Get the image
const img = document.getElementById('targetImage');

// Make a prediction
imagenet.predict(img, 10, gotResult);

// When we get the results
function gotResult(results) {
  const result = document.getElementById('result');
  const probability = document.getElementById('probability');
  result.innerText = results[0].label;
  probability.innerText = results[0].probability.toFixed(2);
}

