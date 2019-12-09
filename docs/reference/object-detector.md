# Object Detector


<center>
    <img style="display:block; max-height:20rem" alt="cat detected by yolo" src="_media/reference__header-yolo.png">
</center>


## Description

Real-time object detection system using either [YOLO](https://pjreddie.com/darknet/yolo/) or [CocoSsd](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) model.

## Quickstart

```js
const video = document.getElementById('video');

// Create a ObjectDetector method
const objectDetector = ml5.ObjectDetector('cocossd', {}, modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Detect objects in the video element
yolo.detect(video, (err, results) => {
  console.log(results); // Will output bounding boxes of detected objects
});
```


## Usage

### Initialize

```js
const objectDetector = ml5.ObjectDetector(modelNameOrUrl);
// OR
const objectDetector = ml5.ObjectDetector(modelNameOrUrl, ?options, ?callback);
```

#### Parameters
* **modelNameOrUrl**: A String value of a valid model OR a url to a `model.json` that contains a pre-trained model. Models available are: ['cocossd'](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd), ['yolo'](https://pjreddie.com/darknet/yolo/)
* **options**: Optional. An object describing a model accuracy and performance. For YOLO this are: `{ filterBoxesThreshold: 0.01, IOUThreshold: 0.4, classProbThreshold: 0.4 }`
* **callback**: Optional. A function to run once the model has been loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.

### Methods


***
#### .detect()
> Given an image or video, returns an array of objects containing class names, bounding boxes and probabilities.

```js
objectDetector.detect(input, ?callback);
```

📥 **Inputs**

* **input**: A HTML video or image element or a p5 image or video element. If no input is provided, the default is to use the video given in the constructor.
* **callback**: A function to run once the model has made the prediction. If no callback is provided, it will return a promise that will be resolved once the model has made a prediction.

📤 **Outputs**

* **Object**: returns an array of objects containing class names, bounding boxes and probabilities.

***


## Examples


**p5.js**
* [COCOSSD_Video](https://github.com/ml5js/ml5-examples/tree/development/p5js/ObjectDetector/COCOSSD_Video)
* [COCOSSD_single_image](https://github.com/ml5js/ml5-examples/tree/development/p5js/ObjectDetector/COCOSSD_Video)
* [YOLO_single_image](https://github.com/ml5js/ml5-examples/tree/development/p5js/ObjectDetector/YOLO_single_image)
* [YOLO_Video](https://github.com/ml5js/ml5-examples/tree/development/p5js/ObjectDetector/YOLO_Video)

**p5 web editor**
* [YOLO_single_image](https://editor.p5js.org/ml5/sketches/YOLO_single_image)
* [YOLO_webcam](https://editor.p5js.org/ml5/sketches/YOLO_webcam)

**plain javascript**
* [COCOSSD_single_image](https://github.com/ml5js/ml5-examples/tree/development/javascript/ObjectDetector/COCOSSD_single_image)
* [COCOSSD_webcam](https://github.com/ml5js/ml5-examples/tree/development/javascript/ObjectDetector/COCOSSD_webcam)
* [YOLO_single_image](https://github.com/ml5js/ml5-examples/tree/development/javascript/ObjectDetector/YOLO_single_image)
* [YOLO_webcam](https://github.com/ml5js/ml5-examples/tree/development/javascript/ObjectDetector/YOLO_webcam)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * Cristobal Valenzuela

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/ObjectDetector](https://github.com/ml5js/ml5-library/tree/development/src/ObjectDetector)
