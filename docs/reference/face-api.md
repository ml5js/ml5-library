# Face-Api

**currently in development - not currently in ml5 release**


<center>
    <img style="display:block; max-height:20rem" alt="face landmark detection" src="https://via.placeholder.com/150">
</center>


## Description

ml5.js has created an API to [face-api.js](https://github.com/justadudewhohacks/face-api.js/blob/master/README.md) that allows you to access face and face landmark detection.  

The ml5.js implementation of face-api does not support `expressions`, `age`, or `gender` estimation.

## Quickstart

```js
const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}
// Initialize the magicFeature
const faceapi = ml5.faceApi(detection_options, modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');

  // Make some sparkles
  faceapi.detect(myImage, function(err, results) {
      console.log(results);
  });
}


```


## Usage

### Initialize

```js
const faceapi = ml5.faceApi(videoOrOptionsOrCallback, optionsOrCallback?, cb?)
```

#### Parameters
* **videoOrOptionsOrCallback**: REQUIRED. Notice there is no question mark in front of the input.
* **optionsOrCallback**: OPTIONAL. Notice the `?` indicates an optional parameter.
* **cb**: OPTIONAL. A description of some kind of object with some properties. Notice the `?` indicates an optional parameter.
  
    ```
    {
      withLandmarks: true,
      withDescriptors: true,
      minConfidence: 0.5,
      MODEL_URLS: {
          Mobilenetv1Model: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/ssd_mobilenetv1_model-weights_manifest.json',
          FaceLandmarkModel: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_landmark_68_model-weights_manifest.json',
          FaceLandmark68TinyNet: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_landmark_68_tiny_model-weights_manifest.json',
          FaceRecognitionModel: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_recognition_model-weights_manifest.json',
      }
    }
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
faceapi.detect(optionsOrCallback, configOrCallback, cb)
```

📥 **Inputs**

* **optionsOrCallback**: Required. Image | Object | Function. If given an image, this is the image that the face detection will be applied. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **configOrCallback**: Optional. Object | Function. If an image is given as the first parameter, then this will either be an object or a function. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **cb**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Array**: Returns an array of objects. Each object contains `{alignedRect, detection, landmarks, unshiftedLandmarks}`.

***

***
#### .detectSingle()
> Given an image, will run face detection. If a video was passed in the contructor, then it only a callback is necessary to handle the results. `.detectSingle()` is more accurate.

```js
faceapi.detectSingle(optionsOrCallback, configOrCallback, cb)
```

📥 **Inputs**
* **optionsOrCallback**: Required. Image | Object | Function. If given an image, this is the image that the face detection will be applied. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **configOrCallback**: Optional. Object | Function. If an image is given as the first parameter, then this will either be an object or a function. If given an object, it is to set the configuration. If given a callback, this is to handle the results of the `.detect()` method.
* **cb**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Array**: Returns an array of objects. Each object contains `{alignedRect, detection, landmarks, unshiftedLandmarks}`.

***




## Examples

**plain javascript**
* [FaceApi_Image_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/javascript/FaceApi/FaceApi_Image_Landmarks/)
* [FaceApi_Video_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/javascript/FaceApi/FaceApi_Video_Landmarks/)
* [FaceApi_Video_Landmarks_LocalModels](https://github.com/ml5js/ml5-examples/tree/development/javascript/FaceApi/FaceApi_Video_Landmarks_LocalModels/)


**p5.js**
* [FaceApi_Image_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/p5js/FaceApi/FaceApi_Image_Landmarks)
* [FaceApi_Video_Landmarks](https://github.com/ml5js/ml5-examples/tree/development/p5js/FaceApi/FaceApi_Video_Landmarks)
* [FaceApi_Video_Landmarks_LocalModels](https://github.com/ml5js/ml5-examples/tree/development/p5js/FaceApi/FaceApi_Video_Landmarks_LocalModels)

**p5 web editor**
* [Example 1]()
* [Example 2]()

## Demo

No demos yet - contribute one today!

## Tutorials

### MagicFeature Tutorial 1 via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/D9BoBSkLvFo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### MagicFeature Tutorial 2 via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/yNkAuWz5lnY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Acknowledgements

**Contributors**:
  * Name 1
  * Name 2

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/FaceApi](https://github.com/ml5js/ml5-library/tree/development/src/FaceApi)

