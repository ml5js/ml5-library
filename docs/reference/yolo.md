# YOLO


<center>
    <img style="display:block; max-height:20rem" alt="image classification of bird" src="https://via.placeholder.com/150">
</center>


## Description

You only look once ([YOLO](https://pjreddie.com/darknet/yolo/)) is a state-of-the-art, real-time object detection system.

From the [creators](https://pjreddie.com/darknet/yolo/) website:

*Prior detection systems repurpose classifiers or localizers to perform detection. They apply the model to an image at multiple locations and scales. High scoring regions of the image are considered detections.*

*We use a totally different approach. We apply a single neural network to the full image. This network divides the image into regions and predicts bounding boxes and probabilities for each region. These bounding boxes are weighted by the predicted probabilities. [Source](https://pjreddie.com/darknet/yolo/)*

This implementation is heavily derived from [ModelDepot](https://github.com/ModelDepot/tfjs-yolo-tiny).

## Quickstart

```js
const video = document.getElementById("video");

// Create a YOLO method
const yolo = ml5.YOLO(video, modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log("Model Loaded!");
}

// Detect objects in the video element
yolo.detect(function(err, results) {
  console.log(results); // Will output bounding boxes of detected objects
});
```


## Usage

### Initialize

```js
const yolo = ml5.YOLO();
// OR
const yolo = ml5.YOLO(video);
// OR
const yolo = ml5.YOLO(video, ?options, ?callback)
// OR
const yolo = ml5.YOLO(?options, ?callback)
```

#### Parameters
* **video**: Optional. A HTML video element or a p5 video element.
* **options**: Optional. An object describing a model accuracy and performance. For MobileNet this are: `{ filterBoxesThreshold: 0.01, IOUThreshold: 0.4, classProbThreshold: 0.4 }`
* **callback**: Optional. A function to run once the model has been loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.


### Properties


***
#### .isPredicting
> *Boolean*. Boolean to check if the model is currently predicting
***


***
#### .modelReady
> *Object*. Boolean to check if the model has loaded
***


### Methods


***
#### .detect()
> Given an image or video, returns an array of objects containing class names, bounding boxes and probabilities.

```js
yolo.detect(input, ?callback)
// OR
yolo.detect(?callback)
```

📥 **Inputs**

* **input**: A HTML video or image element or a p5 image or video element. If no input is provided, the default is to use the video given in the constructor.
* **callback**: A function to run once the model has made the prediction. If no callback is provided, it will return a promise that will be resolved once the model has made a prediction.

📤 **Outputs**

* **Object**: returns an array of objects containing class names, bounding boxes and probabilities.

***


## Examples

**plain javascript**
* [YOLO_single_image]()
* [YOLO_webcam]()

**p5.js**
* [YOLO_single_image]()
* [YOLO_webcam]()

**p5 web editor**
* [YOLO_single_image]()
* [YOLO_webcam]()

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * Name 1
  * Name 2

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/YOLO](https://github.com/ml5js/ml5-library/tree/release/src/YOLO)
