---
id: simple-image-classification-example
title: Simple Image Classification
---

A simple image classification example using the [KNN Image Classifier](api-Imagenet.md). Built using [p5.js](https://p5js.org/).

## Demo

<div class="example">
  <img src="assets/img/kitten.jpg" id="targetImage"/>
  <p>I guess this is a <span id="result">...</span>. My confidence is <span id="probability">...</span></p>
</div>

<script src="assets/scripts/example-simple-image-classification.js"></script>

## Code
```javascript
let imagenet;
let img;

function preload() {
  // Initialize the ImageNet method with the MobileNet model.
  imagenet = new ml5.ImageNet('MobileNet');
}

function setup() {
  img = createImg('/docs/assets/img/kitten.jpg', imageReady);
}

function imageReady() {
  // The image should be 227x227
  img.attribute('width', 227);
  img.attribute('height', 227);
  img.hide();

  // Get a prediction for that image
  imagenet.predict(img.elt, 10, gotResult);
}

// When we get the results
function gotResult(results) {
  // The results are in an array ordered by probability.
  select('#result').html(results[0].label);
  select('#probability').html(nf(results[0].probability, 0, 2));
}
```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/imagenet)