---
id: simple-image-classification-example
title: Simple Image Classification
---

A simple image classification example using the [Imagenet Method](api-Imagenet.md).

## Demo

<div class="example">
  <img src="assets/img/kitten.jpg" id="targetImage"/>
  <p>I guess this is a <span id="result">...</span>. My confidence is <span id="probability">...</span></p>
</div>

<script src="assets/scripts/example-simple-image-classification.js"></script>

## Code
```javascript
// Initialize ImageNet with the MobileNet model.
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
```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/imagenet)