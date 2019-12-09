# Face-Api

**currently in development - coming soon to the ml5 release**


<center>
    <img style="display:block; max-height:20rem" alt="face landmark detection" src="_media/reference__header-faceapi.png">
</center>


## Description

ml5.js has created an API to [face-api.js](https://github.com/justadudewhohacks/face-api.js/blob/master/README.md) that allows you to access face and face landmark detection.  

The ml5.js implementation of face-api does not support `expressions`, `age` or `gender` estimation.

## Quickstart

```js
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
};
// Initialize the magicFeature
const faceapi = ml5.faceApi(detectionOptions, modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');

  // Make some sparkles
  faceapi.detect(myImage, (err, results) => {
    console.log(results);
  });
}


```


## Usage

### Initialize

```js
const faceapi = ml5.faceApi(videoOrOptionsOrCallback, optionsOrCallback?, callback?);
```

#### Parameters
* **videoOrOptionsOrCallback**: REQUIRED. Notice there is no question mark in front of the input.
* **optionsOrCallback**: OPTIONAL. Notice the `?` indicates an optional parameter.
* **callback**: OPTIONAL. A description of some kind of object with some properties. Notice the `?` indicates an optional parameter.

  ```js
  {
    withLandmarks: true,
    withDescriptors: true,
    minConfidence: 0.5,
    MODEL_URLS: {
      Mobilenetv1Model: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/ssd_mobilenetv1_model-weights_manifest.json',
      FaceLandmarkModel: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_landmark_68_model-weights_manifest.json',
      FaceLandmark68TinyNet: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_landmark_68_tiny_model-weights_manifest.json',
      FaceRecognitionModel: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_recognition_model-weights_manifest.json',
    },
  };
  ```

### Properties

***
#### .video
> **Object**: An HTML5Video object if one is passed in the constructor
***

***
#### .model
> **Object**: the model
***

***
#### .modelReady
> **Boolean**: true when model is ready and loaded, false when it is not
***

***
#### .config
> **Object** object of configurations of the model
***

***
#### .ready
> **Boolean**: true when model is ready and loaded, false when it is not
***



### Methods


***
#### .detect()
> Given an image, will run face detection. If a video was passed in the contructor, then it only a callback is necessary to handle the results.

```js
faceapi.detect(optionsOrCallback, configOrCallback, callback);
```

📥 **Inputs**

* **optionsOrCallback**: Required. Image | Object | Function. If given an image, this is the image that the face detection will be applied. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **configOrCallback**: Optional. Object | Function. If an image is given as the first parameter, then this will either be an object or a function. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **callback**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Array**: Returns an array of objects. Each object contains `{alignedRect, detection, landmarks, unshiftedLandmarks}`.

***

***
#### .detectSingle()
> Given an image, will run face detection. If a video was passed in the contructor, then it only a callback is necessary to handle the results. `.detectSingle()` is more accurate.

```js
faceapi.detectSingle(optionsOrCallback, configOrCallback, callback);
```

📥 **Inputs**
* **optionsOrCallback**: Required. Image | Object | Function. If given an image, this is the image that the face detection will be applied. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **configOrCallback**: Optional. Object | Function. If an image is given as the first parameter, then this will either be an object or a function. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **callback**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Array**: Returns an array of objects. Each object contains `{alignedRect, detection, landmarks, unshiftedLandmarks}`.

***




## Examples

**p5.js**
* [FaceApi_Image_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/p5js/FaceApi/FaceApi_Image_Landmarks)
* [FaceApi_Video_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/p5js/FaceApi/FaceApi_Video_Landmarks)
* [FaceApi_Video_Landmarks_LocalModels](https://github.com/ml5js/ml5-examples/tree/development/p5js/FaceApi/FaceApi_Video_Landmarks_LocalModels)

**p5 web editor**
* [FaceApi_Image_Landmarks](https://editor.p5js.org/ml5/sketches/FaceApi_Image_Landmarks)
* [FaceApi_Video_Landmarks](https://editor.p5js.org/ml5/sketches/FaceApi_Video_Landmarks)

**plain javascript**
* [FaceApi_Image_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/javascript/FaceApi/FaceApi_Image_Landmarks/)
* [FaceApi_Video_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/javascript/FaceApi/FaceApi_Video_Landmarks/)
* [FaceApi_Video_Landmarks_LocalModels](https://github.com/ml5js/ml5-examples/tree/development/javascript/FaceApi/FaceApi_Video_Landmarks_LocalModels/)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Acknowledgements

**Contributors**:
  * Ported by [Joey Lee](https://jk-lee.com)

**Credits**:
  * [Face-api.js](https://github.com/justadudewhohacks/face-api.js/blob/master/README.md) is an open source project built by [Vincent Mühler](https://github.com/justadudewhohacks).

## Source Code

* [/src/FaceApi](https://github.com/ml5js/ml5-library/tree/development/src/FaceApi)
