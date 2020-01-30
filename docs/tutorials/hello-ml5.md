# Hello ml5.js - A gentle introduction to ml5


Hello there! If you've landed here, that probably means you're interested in building your first ml5.js project. If so, wonderful! We invite you to read on.

<br/>

ml5.js is being developed to make machine learning more accessible to a wider audience. Along with supporting education and critical engagement with machine learning, the ml5 team is working actively to wrap exciting machine learning functionality in friendlier and easier-to-use way. The following example introduces you ml5.js through a classic application of machine learning: **image classification**.

<br/>

This example showcases how you can use a [pre-trained model](https://youtu.be/yNkAuWz5lnY?t=33) called [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) -- a machine learning model trained to recognize the content of certain images -- in ml5.js. The example aims to highlight a general pattern for how ml5.js projects are setup.

<br/>

ml5.js is growing every day, so be sure to see some of the other applications of ml5 in the [reference](/reference) section and their accompanying examples for the latest offerings.

## Setup

If you've arrived here, we assume you've checked out our [quickstart](/getting-started) page to get a simple ml5.js project set up. To get this to run, you'll need:

> + 📝 A text editor (e.g. [Atom](https://atom.io/), [VSCode](https://code.visualstudio.com/), [Sublimetext](https://www.sublimetext.com/))
> + 💻 Your web browser: Chrome & Firefox preferred
> + 🖼 An image to run your classification on


Your project directory should look something like this:

```
|_ /hello-ml5
  |_ 📂/images
    |_ 🖼 bird.png
  |_ 🗒index.html
  |_ 🗒sketch.js
```

**Where**:

* 📂**/hello-ml5**: is the root project folder
  * &ensp; 📂**/images**: is a folder that contains your image
    * &ensp; &ensp; &ensp; 🖼 **bird.png**: is a .png image of a bird (it can also be something else!)
  * &ensp; 🗒**index.html**: is an .html file that has your html markup and library references
  * &ensp; 🗒**sketch.js**: is where you'll be writing your javascript

## Demo

This example is built with p5.js. You can also find the same example without p5.js [here](https://github.com/ml5js/ml5-examples/tree/release/javascript/ImageClassification).

<br/>

<!-- <div class="example">
  <img src="/assets/img/bird.jpg" id="targetImage" width=400/>
  <p id="status">Loading Model...</p>
  <p>The MobileNet model labeled this as <span id="result">...</span>, with a confidence of <span id="probability">...</span>.</p>
</div> -->

<!-- added inline height -->
<div style="height:800px" class="iframe__container iframe__container--video"><iframe src="https://ml5js.github.io/ml5-examples/p5js/ImageClassification/ImageClassification" frameborder="0" height="800px" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

## Code

### Your index.html

Here you can see that we read in the javascript libraries. This includes our ml5.js version as well as p5.js. You can copy and paste this into your **index.html** file or for good practice you can type it all out. Make sure to save the file and refresh your browser after saving.

```html
<html>

<head>
  <meta charset="UTF-8">
  <title>Image classification using MobileNet and p5.js</title>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js"></script>
  <script src="https://unpkg.com/ml5@0.4.3/dist/ml5.min.js"></script>
</head>

<body>
  <h1>Image classification using MobileNet and p5.js</h1>
  <script src="sketch.js"></script>
</body>

</html>
```


### Your sketch.js

Inside your **sketch.js** file you can type out (or copy and paste) the following code. Notice in this example we have a reference to "images/bird.png". You'll replace this with the name of your image.

```js
// Initialize the Image Classifier method with MobileNet. A callback needs to be passed.
let classifier;

// A variable to hold the image we want to classify
let img;

function preload() {
  classifier = ml5.imageClassifier('MobileNet');
  img = loadImage('images/bird.png');
}

function setup() {
  createCanvas(400, 400);
  classifier.classify(img, gotResult);
  image(img, 0, 0);
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  } else {
    // The results are in an array ordered by confidence.
    console.log(results);
    createDiv(`Label: ${results[0].label}`);
    createDiv(`Confidence: ${nf(results[0].confidence, 0, 2)}`);
  }
}
```

## Our sketch.js explained in 4 steps

### Step 1: Define your variables

Here we define our variables that we will assign our classifier and image to.

```js
// Initialize the Image Classifier method with MobileNet. A callback needs to be passed.
let classifier;

// A variable to hold the image we want to classify
let img;
```

### Step 2: Load your imageClassifier and image

Use p5's **preload()** function to load our imageClassifier model and our bird image before running the rest of our code. Since machine learning models can be large, it can take time to load. We use **preload()** in this case to make sure our imageClassifier and image are ready to go before we can apply the image classification in the next step.

```js
function preload() {
  classifier = ml5.imageClassifier('MobileNet');
  img = loadImage('images/bird.png');
}
```

### Step 3: Setup, classify, and display

In p5.js we use the **setup()** function for everything in our program that just runs once. In our program, we use the **setup()** function to:
1. create a canvas to render our image
2. call .classify() on our classifier to classify our image
3. render the image to the canvas

You will notice that the **.classify()** function takes two parameters: 1. the image you want to classify, and 2. a callback function called **gotResult**. Let's look at what **gotResult** does.

```js
function setup() {
  createCanvas(400, 400);
  classifier.classify(img, gotResult);
  image(img, 0, 0);
}
```

### Step 4: Define the gotResult() callback function

The **gotResult()** function takes two parameters: 1. error, and 2. results. These get passed along to **gotResult()** when the **.classify()** function finishes classifying the image. If there is an error, then an **error** will be logged. If our classifier manages to recognize the content of the image, then a **result** will be returned.

<br/>

In the case of our program, we create a **div** that displays the **label** and the **confidence** of the content of the image that has been classified. The **[nf()](https://p5js.org/reference/#/p5/nf)** function is a p5 function that formats our number to a nicer string.

```js
// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  } else {
    // The results are in an array ordered by confidence.
    console.log(results);
    createDiv(`Label: ${results[0].label}`);
    createDiv(`Confidence: ${nf(results[0].confidence, 0, 2)}`);
  }
}
```

## And voilà!

You've just made a simple machine learning powered program that:
1. takes an image,
2. classifies the content of that image, and
3. displays the results all in your web browser!

Not all of our examples are structured exactly like this, but this provides a taste into how ml5.js is trying to make machine learning more approachable. Try using different images and seeing what kinds of things get returned.

<br/>

Some guiding questions you might start to think about are:

1. When classifying an image with MobileNet, does the computer see people? If not, why do you think that is?
2. Do you notice that MobileNet is better at classifying some animals over others? Why do you think that is?

## [Source](https://github.com/ml5js/ml5-examples/tree/master/p5js/ImageClassification/ImageClassification)

- [ml5.js image classification on Github](https://github.com/ml5js/ml5-examples/tree/master/p5js/ImageClassification/ImageClassification)
- [ml5.js image classification on p5 web editor](https://editor.p5js.org/ml5/sketches/ImageClassification)
