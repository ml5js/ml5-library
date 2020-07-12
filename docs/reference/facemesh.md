# Facemesh


<center>
    <img style="display:block; max-height:20rem" alt="A screenshot of a video video feed where a person sits at their chair inside of a bedroom while green dots are drawn over different locations on their face." src="_media/reference__header-facemesh.jpg">
</center>


## Description

Facemesh is a machine-learning model that allows for facial landmark detection in the browser. It can detect multiple faces at once and provides 486 3D facial landmarks that describe the geometry of each face. Facemesh works best when the faces in view take up a large percentage of the image or video frame and it may struggle with small/distant faces.

The ml5.js Facemesh model is ported from the [TensorFlow.js Handpose implementation](https://github.com/tensorflow/tfjs-models/tree/master/facemesh#keypoints).

## Quickstart

```js
let predictions = [];
const video = document.getElementById('video');

// Create a new facemesh method
const facemesh = ml5.facemesh(video, modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Listen to new 'predict' events
facemesh.on('predict', results => {
  predictions = results;
});
```


## Usage

### Initialize
You can initialize ml5.facemesh with an optional `video`, configuration `options` object, or a `callback` function.
```js
const poseNet = ml5.facemesh(?video, ?options, ?callback);
```

#### Parameters
* **video**: OPTIONAL. Optional HTMLVideoElement input to run predictions on.
* **options**: OPTIONAL. A object that contains properties that effect the Facemesh model accuracy, results, etc. See documentation on the available options in [TensorFlow's Facemesh documentation](https://github.com/tensorflow/tfjs-models/tree/master/facemesh#parameters-for-facemeshload).
* **callback**: OPTIONAL. A function that is called once the model has loaded.

### Properties
***
#### .video
> *Object*. HTMLVideoElement if given in the constructor. Otherwise it is null.
***

***
#### .config
> *Object*. containing all of the configuration options passed into the model. 
***

***
#### .model
> *Object*. The bodyPix model.
***

***
#### .modelReady
> *Boolean*. Truthy value indicating the model has loaded.
***

### Methods

***
#### .predict()
> A function that returns the results of a single face detection prediction.

```js
facemesh.predict(inputMedia, callback);
```

📥 **Inputs**
* **inputMedia**: REQUIRED. An HMTL or p5.js image, video, or canvas element that you'd like to run a single prediction on.

* **callback**: OPTIONAL.  A callback function to handle new face detection predictions. For example:

```js
poseNet.predict(inputMedia, results => {
  // do something with the results
  console.log(results);
});
```

📤 **Outputs**

* **Array**: Returns an array of objects describing each detected face. See the [Facemesh keypoints map](https://github.com/tensorflow/tfjs-models/tree/master/facemesh#keypoints) to determine how the keypoint related to facial landmarks.

```js
[
    {
        faceInViewConfidence: 1, // The probability of a face being present.
        boundingBox: { // The bounding box surrounding the face.
            topLeft: [232.28, 145.26],
            bottomRight: [449.75, 308.36],
        },
        mesh: [ // The 3D coordinates of each facial landmark.
            [92.07, 119.49, -17.54],
            [91.97, 102.52, -30.54],
            ...
        ],
        scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
            [322.32, 297.58, -17.54],
            [322.18, 263.95, -30.54]
        ],
        annotations: { // Semantic groupings of the `scaledMesh` coordinates.
            silhouette: [
            [326.19, 124.72, -3.82],
            [351.06, 126.30, -3.00],
            ...
            ],
            ...
        }
    }
]
```

***

#### .on('predict', ...)
> An event listener that returns the results when a new face detection prediction occurs.

```js
facemesh.on('predict', callback);
```

📥 **Inputs**

* **callback**: REQUIRED.  A callback function to handle new face detection predictions. For example:

```js
poseNet.on('predict', results => {
  // do something with the results
  console.log(results);
});
```

📤 **Outputs**

* **Array**: Returns an array of objects describing each detected face as an array of objects exactly like the output of the `.predict()` method described above. See the [Facemesh keypoints map](https://github.com/tensorflow/tfjs-models/tree/master/facemesh#keypoints) to determine how the keypoint related to facial landmarks.


## Examples

**p5.js**
* [Facemesh_Image](https://github.com/ml5js/ml5-library/tree/development/examples/p5js/Facemesh/Facemesh_Image)
* [Facemesh_Webcam](https://github.com/ml5js/ml5-library/tree/development/examples/p5js/Facemesh/Facemesh_Webcam)

**p5 web editor**
* [Facemesh_Image](https://editor.p5js.org/ml5/sketches/Facemesh_Image)
* [Facemesh_Webcam](https://editor.p5js.org/ml5/sketches/Facemesh_Webcam)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * Ported to ml5.js by [Bomani Oseni McClendon](https://bomani.xyz/).

## Source Code

* [/src/Facemesh](https://github.com/ml5js/ml5-library/tree/development/src/Facemesh)
