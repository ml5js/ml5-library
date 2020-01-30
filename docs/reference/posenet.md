# PoseNet


<center>
    <img style="display:block; max-height:20rem" alt="pose detection" src="_media/reference__header-posenet.jpg">
    <p>image via: https://pdm.com.co/tag/posenet/</p>
</center>


## Description

PoseNet is a machine learning model that allows for Real-time Human Pose Estimation.

PoseNet can be used to estimate either a single pose or multiple poses, meaning there is a version of the algorithm that can detect only one person in an image/video and one version that can detect multiple persons in an image/video.

The original PoseNet model was ported to TensorFlow.js by Dan Oved. Check out his blog post.

## Quickstart

```js
const video = document.getElementById('video');

// Create a new poseNet method
const poseNet = ml5.poseNet(video, modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}
// Listen to new 'pose' events
poseNet.on('pose', (results) => {
  poses = results;
});
```


## Usage

### Initialize
There are a couple ways to initialize `ml5.poseNet`.
```js
// Initialize with video, type and callback
const poseNet = ml5.poseNet(?video, ?type, ?callback);
// OR Initialize with video, options and callback
const poseNet = ml5.poseNet(?video, ?options, ?callback);
// OR Initialize WITHOUT video. Just options and callback here
const poseNet = ml5.poseNet(?callback, ?options);
```

#### Parameters
* **video**: OPTIONAL. Optional HTMLVideoElement input to run poses on.
* **type**: OPTIONAL. A String value to run `single` or `multiple` estimation. Changes the `detectionType` property of the options. Default is `multiple`.
* **callback**: OPTIONAL. A function that is called when the model is loaded.
* **options**: OPTIONAL. A object that contains properties that effect the posenet model accuracy, results, etc.

  ```js
  {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.5,
    maxPoseDetections: 5,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'multiple',
    inputResolution: 513,
    multiplier: 0.75,
    quantBytes: 2,
  };
  ```

### Properties

***
#### .net
> The poseNet model
***

***
#### .video
> The optional video added to the
***

***
#### .architecture
> The model architecture
***

***
#### .detectionType
> The detection type
***

***
#### .imageScaleFactor
> The image scale factor
***

***
#### .outputStride
> Can be one of 8, 16, 32 (Stride 16, 32 are supported for the ResNet architecture and stride 8, 16, 32 are supported for the MobileNetV1 architecture). It specifies the output stride of the PoseNet model. The smaller the value, the larger the output resolution, and more accurate the model at the cost of speed. Set this to a larger value to increase speed at the cost of accuracy.
***

***
#### .flipHorizontal
> Boolean. Flip the image horizontal or not.
***

***
#### .scoreThreshold
> The threshold for returned values. Between 0 and 1. Only return instance detections that have root part score greater or equal to this value. Defaults to 0.5.
***


***
#### .maxPoseDetections
> the maximum number of poses to detect. Defaults to 5.
***

***
#### .multiplier
> Can be one of 1.01, 1.0, 0.75, or 0.50 (The value is used only by the MobileNetV1 architecture and not by the ResNet architecture). It is the float multiplier for the depth (number of channels) for all convolution ops. The larger the value, the larger the size of the layers, and more accurate the model at the cost of speed. Set this to a smaller value to increase speed at the cost of accuracy.
***

***
#### .inputResolution
> Can be one of 161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513, and 801. Defaults to 257. It specifies the size the image is resized to before it is fed into the PoseNet model. The larger the value, the more accurate the model at the cost of speed. Set this to a smaller value to increase speed at the cost of accuracy.
***

***
#### .quantBytes
>This argument controls the bytes used for weight quantization. The available options are: 4. 4 bytes per float (no quantization). Leads to highest accuracy and original model size (~90MB). 2. 2 bytes per float. Leads to slightly lower accuracy and 2x model size reduction (~45MB). 1. 1 byte per float. Leads to lower accuracy and 4x model size reduction (~22MB).
***

***
#### .nmsRadius
> Non-maximum suppression part distance. It needs to be strictly positive. Two parts suppress each other if they are less than nmsRadius pixels away. Defaults to 20.
***


### Methods

***
#### .on('pose', ...)
> An event listener that returns the results when a pose is detected. You can use this with `.singlePose()` or `.multiPose()` or just listen for poses if you pass in a `video` into the constructor.

```js
poseNet.on('pose', callback);
```

📥 **Inputs**

* **callback**: REQUIRED.  A callback function to handle the results when a pose is detected. For example.

```js
poseNet.on('pose', (results) => {
  // do something with the results
  console.log(results);
});
```

📤 **Outputs**

* **Array**: Returns an array of objects. See documentation for `.singlePose()` and `.multiPose()`

***


***
#### .singlePose()
> Given a number, will make magicSparkles

```js
poseNet.singlePose(?input);
```

📥 **Inputs**

* **input**: Optional.  A HTML video or image element or a p5 image or video element. If no input is provided, the default is to use the video given in the constructor.

📤 **Outputs**

* **Array**: Returns an array of objects. A sample is included below.

  ```js
  [
    {
      pose: {
        keypoints: [{ position: { x, y }, score, part }, ...],
        leftAngle: { x, y, confidence },
        leftEar: { x, y, confidence },
        leftElbow: { x, y, confidence },
        ...
      },
    },
  ];
  ```
***

***
#### .multiPose()
> Given a number, will make magicSparkles

```js
poseNet.multiPose(?input);
```

📥 **Inputs**

* **input**: Optional. Number.  A HTML video or image element or a p5 image or video element. If no input is provided, the default is to use the video given in the constructor.

📤 **Outputs**

* **Array**: Returns an array of objects. A sample is included below.

  ```js
  [
    {
      pose: {
        keypoints: [{ position: { x, y }, score, part }, ...],
        leftAngle: { x, y, confidence },
        leftEar: { x, y, confidence },
        leftElbow: { x, y, confidence },
        ...
      },
    },
    {
      pose: {
        keypoints: [{ position: { x, y }, score, part }, ...],
        leftAngle: { x, y, confidence },
        leftEar: { x, y, confidence },
        leftElbow: { x, y, confidence },
        ...
      },
    },
  ];
  ```
***


## Examples

**p5.js**
* [PoseNet_image_single](https://github.com/ml5js/ml5-examples/tree/development/p5js/PoseNet/PoseNet_image_single)
* [PoseNet_part_selection](https://github.com/ml5js/ml5-examples/tree/development/p5js/PoseNet/PoseNet_part_selection)
* [PoseNet_webcam](https://github.com/ml5js/ml5-examples/tree/development/p5js/PoseNet/PoseNet_webcam)

**p5 web editor**
* [PoseNet_image_single](https://editor.p5js.org/ml5/sketches/PoseNet_image_single)
* [PoseNet_part_selection](https://editor.p5js.org/ml5/sketches/PoseNet_part_selection)
* [PoseNet_webcam](https://editor.p5js.org/ml5/sketches/PoseNet_webcam)

**plain javascript**
* [PoseNet_image_single](https://github.com/ml5js/ml5-examples/tree/development/javascript/PoseNet/PoseNet_image_single)
* [PoseNet_part_selection](https://github.com/ml5js/ml5-examples/tree/development/javascript/PoseNet/PoseNet_part_selection)
* [PoseNet_webcam](https://github.com/ml5js/ml5-examples/tree/development/javascript/PoseNet/PoseNet_webcam)

## Demo

No demos yet - contribute one today!

## Tutorials

### PoseNet featured on Hour of Code via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/EA3-k9mnLHs" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Acknowledgements

**Contributors**:
  * Cristobal Valenzuela, Maya Man, Dan Oved

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/PoseNet](https://github.com/ml5js/ml5-library/tree/development/src/PoseNet)
