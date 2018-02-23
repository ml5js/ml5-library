---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

ML5.js is heavily inspired by [Processing](https://processing.org/) and [p5.js](https://p5js.org/) and therefore, is meant to make machine learning accessible to artists, designers, educators and beginners by providing a simple and intuitive interface to common ML capabilities.

## Setup

Download the [latest version](https://github.com/ITPNYU/ml5) of ML5.js and save the following HTML file to your computer:

```html
<!DOCTYPE html>
  <html>
    <head>
      <meta charset=utf-8>
      <title>Intro to ML5.js</title>
    </head>
    <body>
      <script src="libraries/ml5.min.js"></script>
      <script>
        // Your code will go here 
      </script>
    </body>
  </html>
```

That's all!

## Creating a simple image recognition example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset=utf-8>
    <title>Intro to ML5.js</title>
    <script src="libraries/ml5.min.js"></script>
    <script>
      // Initialize the imageNet method with the SqueezeNet model.
      let imagenet = new ml5.ImageNet('SqueezeNet');

      function onImageReady() {
        // Get the image element from the page
        let img = document.getElementById('image');

        // Force the image into a smaller size/ratio for the classifier
        img.width = 227;
        img.height = 227;

        // Get a prediction for that image
        imagenet.predict(img, 10, gotResult);
      }

      // When we get the results
      function gotResult(results) {
        // The results are in an array ordered by probability.
        console.log(results);
        document.getElementById('result').innerText = results[0].label;
        document.getElementById('probability').innerText = results[0].probability.toPrecision(2);
      }
    </script>
  </head>
  <body>

  <!-- This is the image we want to use. We can change the src later in code. We set crossOrigin to anonymous because imgur will respect that and send CORS headers. Not needed if you're loading an image from your own domain. -->

  <h1>Simple Image Classification Example</h1>
  <img id="image" crossOrigin="anonymous" src="https://i.imgur.com/wxrLX68.jpg" onload="onImageReady()">

  <p>I guess this is a <span id="result">...</span>. My confidence is <span id="probability">...</span></p>

  </body>
</html>
```
