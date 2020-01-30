# UNET


<center>
    <img style="display:block; max-height:20rem" alt="Illustration of a background masked behind a person" src="_media/reference__header-unet.png">
</center>


## Description

The U-Net is a convolutional neural network that was developed for biomedical image segmentation at the Computer Science Department of the University of Freiburg, Germany.[1] The network is based on the fully convolutional network [2] and its architecture was modified and extended to work with fewer training images and to yield more precise segmentations.

UNET allows you to segment an image.

The ml5 unet `face` allows you to remove, for example, the background from video of the upper body of person.


## Quickstart

```js
// load your model...
const uNet = ml5.uNet('face');

// assuming you have an HTMLVideo feed...
uNet.segment(video, gotResult);

function gotResult(error, result) {
  // if there's an error return it
  if (error) {
    console.error(error);
    return;
  }
  // log your result
  console.log(result);
}
```


## Usage

### Initialize

```js
const unet = ml5.uNet(model, ?callback);
```

#### Parameters
* **model**: A string to the path of the JSON model.
* **callback**: Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.


### Properties


***
#### .ready
> *Boolean*. Boolean value that specifies if the model has loaded.
***


### Methods

<!-- /////////////////////
FUNCTION DEFINITION START
* Notice that each function definition is wrapped in three stars `***`
* This creates lines to contain everything
///////////////////////// -->
***
#### .segment()
> segments the image

```js
unet.segment(?video, ?callback);
```

📥 **Inputs**
* **video**: Optional. A HTML video element or a p5 video element.
* **callback**: Optional. A function to run once the model has been loaded.

📤 **Outputs**

* **Object**: Returns an Object.
  ```js
  {
    segmentation: mask,
    blob: {
      featureMask: *Blob*,
      backgroundMask: *Blob*,
    },
    tensor: {
      featureMask: *Tensor*,
      backgroundMask: *Tensor*,
    },
    raw: {
      featureMask: *ImageData*,
      backgroundMask: *ImageData*,
    },
    // returns if p5 is available
    featureMask: *p5Image*,
    backgroundMask: *p5Image*,
    mask: *p5Image*,
  };
  ```

***


## Examples

**p5.js**
* [UNET_webcam](https://github.com/ml5js/ml5-examples/tree/development/p5js/UNET/UNET_webcam)

**p5 web editor**
* [UNET_webcam](https://editor.p5js.org/ml5/sketches/UNET_webcam)

**plain javascript**
* [UNET_webcam](https://github.com/ml5js/ml5-examples/tree/development/javascript/UNET/UNET_webcam)


## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Acknowledgements

**Contributors**:
  * Developed by [Zaid Alyafeai](https://github.com/zaidalyafeai)
  * Additional contributions by [Joey Lee](https://github.com/joeyklee)

**Credits**:
  * UNET 'face' was trained by [Zaid Alyafeai](https://github.com/zaidalyafeai) using [mut1ny - Face/Head segmentation dataset](http://www.mut1ny.com/face-headsegmentation-dataset).

## Source Code

* [/src/UNET/](https://github.com/ml5js/ml5-library/tree/development/src/UNET)
