# BodyPix


<center>
    <img style="display:block; max-height:20rem" alt="BodyPix Header Image of Harriet Tubman" src="/../images/reference__header-bodypix.png">
</center>


## Description
As written by the developers of BodyPix:

"Bodypix is an open-source machine learning model which allows for person and body-part segmentation in the browser with TensorFlow.js. In computer vision, image segmentation refers to the technique of grouping pixels in an image into semantic areas typically to locate objects and boundaries. The BodyPix model is trained to do this for a person and twenty-four body parts (parts such as the left hand, front right lower leg, or back torso). In other words, BodyPix can classify the pixels of an image into two categories: 1) pixels that represent a person and 2) pixels that represent background. It can further classify pixels representing a person into any one of twenty-four body parts."

## Quickstart

```js
const bodypix = ml5.bodyPix(modelReady)

function modelReady() {
  // segment the image given
  bodypix.segment(img, gotResults)
}

function gotImage(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  // log the result
  console.log(result.maskBackground);
}
```


## Usage

### Initialize

```js
const bodyPix = new ml5.bodyPix(?video, ?options, ?callback)
```

#### Parameters
* **video**: OPTIONAL. An HTMLVideoElement
* **callback**: REQUIRED. A function to run once the model has been loaded.
* **options**: OPTIONAL. An object to change the defaults (shown below). The available options are:
    ```
    {
      "multiplier": 0.75, // 1.0, 0.75, or 0.50, 0.25
      "outputStride": 16, // 8, 16, or 32, default is 16
      "segmentationThreshold": 0.5, // 0 - 1, defaults to 0.5 
      "palette":{
        "leftFace": {
            "id": 0,
            "color": [110, 64, 170]
        },
        "rightFace": {
            "id": 1,
            "color": [106, 72, 183]
        },
        "rightUpperLegFront": {
            "id": 2,
            "color": [100, 81, 196]
        },
        "rightLowerLegBack": {
            "id": 3,
            "color": [92, 91, 206]
        },
        "rightUpperLegBack": {
            "id": 4,
            "color": [84, 101, 214]
        },
        "leftLowerLegFront": {
            "id": 5,
            "color": [75, 113, 221]
        },
        "leftUpperLegFront": {
            "id": 6,
            "color": [66, 125, 224]
        },
        "leftUpperLegBack": {
            "id": 7,
            "color": [56, 138, 226]
        },
        "leftLowerLegBack": {
            "id": 8,
            "color": [48, 150, 224]
        },
        "rightFeet": {
            "id": 9,
            "color": [40, 163, 220]
        },
        "rightLowerLegFront": {
            "id": 10,
            "color": [33, 176, 214]
        },
        "leftFeet": {
            "id": 11,
            "color": [29, 188, 205]
        },
        "torsoFront": {
            "id": 12,
            "color": [26, 199, 194]
        },
        "torsoBack": {
            "id": 13,
            "color": [26, 210, 182]
        },
        "rightUpperArmFront": {
            "id": 14,
            "color": [28, 219, 169]
        },
        "rightUpperArmBack": {
            "id": 15,
            "color": [33, 227, 155]
        },
        "rightLowerArmBack": {
            "id": 16,
            "color": [41, 234, 141]
        },
        "leftLowerArmFront": {
            "id": 17,
            "color": [51, 240, 128]
        },
        "leftUpperArmFront": {
            "id": 18,
            "color": [64, 243, 116]
        },
        "leftUpperArmBack": {
            "id": 19,
            "color": [79, 246, 105]
        },
        "leftLowerArmBack": {
            "id": 20,
            "color": [96, 247, 97]
        },
        "rightHand": {
            "id": 21,
            "color": [115, 246, 91]
        },
        "rightLowerArmFront": {
            "id": 22,
            "color": [134, 245, 88]
        },
        "leftHand": {
            "id": 23,
            "color": [155, 243, 88]
        }
      }
    }
    ```

### Properties

***
#### .video
> *Object*. HTMLVideoElement if given in the constructor. Otherwise it is null.
***

***
#### .model
> *Object*. The bodyPix model.
***

***
#### .modelReady
> *Boolean*. Truthy value indicating the model has loaded.
***

***
#### .modelPath
> *String*. The path to the model.
***

***
#### .config
> *Object*. The configuration options of bodyPix.
***



### Methods

***
#### .segment()
> Allows you to segment a person from the background.

```js
bodyPix.segment(?input, ?options, callback)
```

📥 **Inputs**

* **input**: HTMLImageElement | ImageData | HTMLCanvasElement. NOTE: Videos should be added in the constructor.
* **options**: Object. You can change the `outputStride  and   `segmentationThreshold`
* **callback**: Function. A function to handle the results of `.segment()`. Likely a function to do something with the segmented image.

📤 **Outputs**

* **Object**: Returns an Object. "{raw}", "{maskBackground}", and "{maskPerson}". The returns will either be a UInt8 array corresponding to the image array or a p5Image if p5.js is available.

***

***
#### .segmentWithParts()


> Allows you to get the segmented body parts of the person.


```js
bodyPix.segmentWithParts(?input, ?options, callback)
```

📥 **Inputs**

* **input**: HTMLImageElement | ImageData | HTMLCanvasElement. NOTE: Videos should be added in the constructor.
* **options**: Object. You can change the `outputStride  and   `segmentationThreshold`
* **callback**: Function. A function to handle the results of `.segment()`. Likely a function to do something with the segmented image.

📤 **Outputs**

* **Object**: Returns an Object. "{raw}". The returns will either be a UInt8 array corresponding to the image array or a p5Image if p5.js is available.

***


## Examples

**plain javascript**
* [Segmentation on Image]()
* [Segmentation on Video]()
* [SegmentationWithParts on Video]()

**p5.js**
* [Segmentation on Image]()
* [Segmentation on Video]()
* [SegmentationWithParts on Video]()

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Source Code

* [/src/BodyPix]()
