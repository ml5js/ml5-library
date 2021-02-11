# BodyPix


<center>
    <img style="display:block; max-height:20rem" alt="BodyPix Header Image of Harriet Tubman" src="_media/reference__header-bodypix.png">
</center>


## Description
As written by the developers of BodyPix:

"Bodypix is an open-source machine learning model which allows for person and body-part segmentation in the browser with TensorFlow.js. In computer vision, image segmentation refers to the technique of grouping pixels in an image into semantic areas typically to locate objects and boundaries. The BodyPix model is trained to do this for a person and twenty-four body parts (parts such as the left hand, front right lower leg, or back torso). In other words, BodyPix can classify the pixels of an image into two categories: 1) pixels that represent a person and 2) pixels that represent background. It can further classify pixels representing a person into any one of twenty-four body parts."

## Quickstart

```js
const bodypix = ml5.bodyPix(modelReady);

function modelReady() {
  // segment the image given
  bodypix.segment(img, gotResults);
}

function gotResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  // log the result
  console.log(result.backgroundMask);
}
```


## Usage

### Initialize

```js
const bodyPix = new ml5.bodyPix(?video, ?options, ?callback);
```

#### Parameters
* **video**: OPTIONAL. An HTMLVideoElement
* **callback**: REQUIRED. A function to run once the model has been loaded.
* **options**: OPTIONAL. An object to change the defaults (shown below). The available options are:
  ```js
  {
    multiplier: 0.75, // 1.0, 0.75, or 0.50, 0.25
    outputStride: 16, // 8, 16, or 32, default is 16
    segmentationThreshold: 0.5, // 0 - 1, defaults to 0.5
    palette: {
      leftFace: {
        id: 0,
        color: [110, 64, 170],
      },
      rightFace: {
        id: 1,
        color: [106, 72, 183],
      },
      rightUpperLegFront: {
        id: 2,
        color: [100, 81, 196],
      },
      rightLowerLegBack: {
        id: 3,
        color: [92, 91, 206],
      },
      rightUpperLegBack: {
        id: 4,
        color: [84, 101, 214],
      },
      leftLowerLegFront: {
        id: 5,
        color: [75, 113, 221],
      },
      leftUpperLegFront: {
        id: 6,
        color: [66, 125, 224],
      },
      leftUpperLegBack: {
        id: 7,
        color: [56, 138, 226],
      },
      leftLowerLegBack: {
        id: 8,
        color: [48, 150, 224],
      },
      rightFeet: {
        id: 9,
        color: [40, 163, 220],
      },
      rightLowerLegFront: {
        id: 10,
        color: [33, 176, 214],
      },
      leftFeet: {
        id: 11,
        color: [29, 188, 205],
      },
      torsoFront: {
        id: 12,
        color: [26, 199, 194],
      },
      torsoBack: {
        id: 13,
        color: [26, 210, 182],
      },
      rightUpperArmFront: {
        id: 14,
        color: [28, 219, 169],
      },
      rightUpperArmBack: {
        id: 15,
        color: [33, 227, 155],
      },
      rightLowerArmBack: {
        id: 16,
        color: [41, 234, 141],
      },
      leftLowerArmFront: {
        id: 17,
        color: [51, 240, 128],
      },
      leftUpperArmFront: {
        id: 18,
        color: [64, 243, 116],
      },
      leftUpperArmBack: {
        id: 19,
        color: [79, 246, 105],
      },
      leftLowerArmBack: {
        id: 20,
        color: [96, 247, 97],
      },
      rightHand: {
        id: 21,
        color: [115, 246, 91],
      },
      rightLowerArmFront: {
        id: 22,
        color: [134, 245, 88],
      },
      leftHand: {
        id: 23,
        color: [155, 243, 88],
      },
    },
  };
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
bodyPix.segment(?input, ?options, callback);
```

📥 **Inputs**

* **input**: HTMLImageElement | | HTMLVideoElement | ImageData | HTMLCanvasElement. NOTE: Videos can be added in the constructor.
* **options**: Object. You can change the `outputStride`  and   `segmentationThreshold`
* **callback**: Function. A function to handle the results of `.segment()`. Likely a function to do something with the segmented image.

📤 **Outputs**

* **Object**: Returns an Object. The returns will either be a UInt8 array corresponding to the image array or a p5Image if p5.js is available.
```js
{
    segmentation,
    raw: {
      personMask: null,
      backgroundMask: null,
    },
    tensor: {
      personMask: null,
      backgroundMask: null,
    },
    personMask: null,
    backgroundMask: null,
}
```

***

***
#### .segmentWithParts()


> Allows you to get the segmented body parts of the person.


```js
bodyPix.segmentWithParts(?input, ?options, callback);
```

📥 **Inputs**

* **input**: HTMLImageElement | HTMLVideoElement | ImageData | HTMLCanvasElement. NOTE: Videos can be added in the constructor.
* **options**: Object. You can change the `outputStride`  and   `segmentationThreshold`
* **callback**: Function. A function to handle the results of `.segment()`. Likely a function to do something with the segmented image.

📤 **Outputs**

* **Object**: Returns an Object. The returns will either be a UInt8 array corresponding to the image array or a p5Image if p5.js is available.
```js
{
    segmentation: *ImageData*,
    raw: {
      personMask: *ImageData*,
      backgroundMask: *ImageData*,
      partMask: *ImageData*
    },
    tensor: {
      personMask: *Tensor*,
      backgroundMask: *Tensor*,
      partMask: *Tensor*,
    },
    personMask: *P5Image*,
    backgroundMask: *P5Image*,
    partMask: *P5Image*,
    bodyParts: *JSONObject*
}
```

***


## Examples

**p5.js**
* [BodyPix_Image](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/BodyPix/BodyPix_Image)
* [BodyPix_Webcam](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/BodyPix/BodyPix_Webcam)
* [BodyPix_Webcam_Parts](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/BodyPix/BodyPix_Webcam_Parts)
* [BodyPix_p5Instance](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/BodyPix/BodyPix_p5Instance)

**p5 web editor**
* [BodyPix_Image](https://editor.p5js.org/ml5/sketches/BodyPix_Image)
* [BodyPix_Webcam](https://editor.p5js.org/ml5/sketches/BodyPix_Webcam)
* [BodyPix_Webcam_Parts](https://editor.p5js.org/ml5/sketches/BodyPix_Webcam_Parts)
* [BodyPix_p5Instance](https://editor.p5js.org/ml5/sketches/BodyPix_p5Instance)

**plain javascript**
* [BodyPix_Image](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/BodyPix/BodyPix_Image)
* [BodyPix_Webcam](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/BodyPix/BodyPix_Webcam)
* [BodyPix_Webcam_Parts](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/BodyPix/BodyPix_Webcam_Parts)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

TBD

#### MobileNetV1 - Model Biography

- **Description**
  - MobileNet is a term that describes a type of machine learning model architecture that has been optimized to run on platforms with limited computational power, such as applications on mobile or embedded devices. MobileNets have several use cases, including image classification, object detection, and image segmentation. This particular MobileNet model is also a type of convolutional neural network (CNN) and was trained to detect people and 24 general regions of the body in an image or video.
  - A CNN finds patterns in the pixels of images (e.g. horizontal or vertical edges), and through successive layers of computation finds sets of patterns to identify more complex patterns (e.g. corners or circles), eventually detecting intricate patterns that it predicts belong to a particular category (e.g. left face or rightUpperArmFront). The categories depend on how images in the model’s training dataset are labeled.
  - ml5 defaults using a MobileNet created with TensorFlow.js, a JavaScript library from TensorFlow, an open source machine learning platform developed by Google.
- **Developer and Year**
  - Google’s TensorFlow.js team. The TensorFlow.js BodyPix models were developed by Dan Oved from NYU and Tyler Zhu at Google Research and additional contributors in 2019
- **Purpose and Intended Users**
  - From the website: TensorFlow is an open source machine learning platform that “has a comprehensive, flexible ecosystem of tools, libraries, and community resources that lets researchers push the state-of-the-art in ML and developers easily build and deploy ML-powered applications.” This model is available for use in the ml5 library because Tensorflow licenses it with Apache License 2.0.
- **Hosted Location**
  - As of June 2019, ml5 imports MobileNetV1 from TensorFlow, hosted on the NPM database. This means that your ml5 sketch will automatically use the most recent version distributed on NPM. 
- **ml5 Contributor and Year**
  - Ported by Joey Lee in 2019
- **References**
  - Website [TensorFlow](https://www.tensorflow.org/)
  - Developers [Dan Oved](https://www.danioved.com/) and [Tyler Zhu](https://ai.google/research/people/TylerZhu)
  - ml5 Contributor [Joey Lee](https://jk-lee.com/)
  - GitHub Repository [TensorFlow.js BodyPix - Person Segmentation in the Browser Repository](https://github.com/tensorflow/tfjs-models/tree/master/body-pix#acknowledgement)
  - Article [Introducing BodyPix: Real-time Person Segmentation in the Browser with TensorFlow.js](https://medium.com/tensorflow/introducing-bodypix-real-time-person-segmentation-in-the-browser-with-tensorflow-js-f1948126c2a0)

#### MobileNetV1- Data Biography

- **Description**
  - From the article, The model was trained on (1) images from the COCO dataset and also (2) images that were digitally generated, also referred to as a “simulated data.”
- **Source**
  - From the website: The COCO dataset is managed by a number of collaborators from both academic and commercial organizations for “large-scale object detection, segmentation, and captioning,” and according to the paper, images were collected from Flickr. 
  - Per Karlsson from Google Research rendered the simulated images for the rest of the dataset.
- **Collector and Year**
  - The COCO database began in 2014.
- **Collection Method**
  - COCO methods for collecting images and annotating pixels into segments are described  in the paper.
- **Purpose and Intended Users**
  - The COCO dataset was created to advance computer vision research. 
  - From the article, the reason for using a mixed dataset with simulated data: “It is time-consuming to manually annotate a large amount of training data for the task of segmenting pixels in an image into twenty four body part regions. Instead, we internally use computer graphics to render images with ground truth body part segmentation annotations. To train our model, we mixed the rendered images and real COCO images (with 2D keypoints and instance segmentation annotations).”
- **References**
  - Paper [Microsoft COCO: Common Objects in Context](https://arxiv.org/abs/1405.0312)
  - Website [Microsoft COCO: Common Objects in Context](http://cocodataset.org/#home)
  - Article [Introducing BodyPix: Real-time Person Segmentation in the Browser with TensorFlow.js](https://medium.com/tensorflow/introducing-bodypix-real-time-person-segmentation-in-the-browser-with-tensorflow-js-f1948126c2a0)


## Acknowledgements

**Contributors**:
  * Ported to ml5.js by [Joey Lee](https://jk-lee.com).

**Credits**:
  * The BodyPix model was developed by [Dan Oved](https://www.danioved.com/) and [Tyler Zhu](https://ai.google/research/people/TylerZhu) and their [additional contributors](https://github.com/tensorflow/tfjs-models/tree/master/body-pix#acknowledgement). Learn more about BodyPix:
    * [BodyPix on Github](https://github.com/tensorflow/tfjs-models/tree/master/body-pix#acknowledgement)
    * [BodyPix blog post release](https://medium.com/tensorflow/introducing-bodypix-real-time-person-segmentation-in-the-browser-with-tensorflow-js-f1948126c2a0)


## Source Code

* [/src/BodyPix](https://github.com/ml5js/ml5-library/tree/main/src/BodyPix)
