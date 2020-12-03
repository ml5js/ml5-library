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
* [UNET_webcam](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/UNET/UNET_webcam)

**p5 web editor**
* [UNET_webcam](https://editor.p5js.org/ml5/sketches/UNET_webcam)

**plain javascript**
* [UNET_webcam](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/UNET/UNET_webcam)


## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

A nice description of the models overview

#### U-Net Face - Model Biography

- **Description**
  - This model is a type of convolutional neural network (CNN) that finds patterns in the pixels of images (e.g. horizontal or vertical edges), and through successive layers of computation finds sets of patterns to identify more complex patterns (e.g. corners or circles), eventually detecting intricate patterns that it predicts belong to a particular category. The categories depend on how images in the model’s training dataset are labeled.
  - The ml5 U-NET is trained for person and body-part segmentation in images and video. This means that the model can classify the pixel regions belonging to a person, as well as regions of the body.
  - Technical information about how the U-Net model was designed is provided in the source website and associated paper linked below.
- **Developer and Year**
  - The model architecture was developed at the University of Freiburg, Germany, in 2015.
- **Purpose and Intended Users**
  - A U-Net is a type of model originally trained for biomedical image segmentation, such as to track cells. The University of Freiburg makes the model available without an accompanying license.
- **Hosted Location**
  - The model is hosted by Zaid Alyafeai.
- **ml5 Contributor and Year**
  - Ported by Zaid Alyafeai with additional contributions by Joey Lee in 2019.
- **References**
  - Website [U-Net: Convolutional Networks for Biomedical Image Segmentation, University of Freiburg, Germany](https://lmb.informatik.uni-freiburg.de/people/ronneber/u-net/)
  - Developers / ml5 Contributors [Zaid Alyafeai](https://github.com/zaidalyafeai) and [Joey Lee](https://github.com/joeyklee)
  - Paper [U-Net: Convolutional Networks for Biomedical Image Segmentation](https://arxiv.org/abs/1505.04597)

#### U-Net Face - Data Biography

- **Description**
  - Though the original dataset contains photographs in which pixels are categorized and labeled for facial parts, the ml5 implementation only masks out the upper body of a person in an image or video.
- **Source**
  - The dataset is managed and available from Mut1ny, a software development and consulting company. There are two different datasets available which are referred to as a normal dataset and a larger commercial/research partner dataset.
- **Collector and Year**
  - Mut1ny
- **Collection Method**
  - Some of the labeled data are crowdsourced. Those who wish to use the full dataset are requested to make a financial donation or to contribute annotated images that were previously unlabeled. Mut1ny provides the images and a software tool for labeling pixel regions.
- **Purpose and Intended Users**
  - According to the Mut1ny website, the data were collected “to generate useful tools in different application areas, but also next-generation tools in the image/video space. This hopefully will allow visual creatives and potentially beyond to reduce the grind work and allow creatives to spen[d] more time on what they like to do best - being creative!”
- **References**
  - Website [Mut1ny](https://www.mut1ny.com/face-headsegmentation-dataset)
  - Website [Mut1ny Patreon](https://www.patreon.com/mut1ny)



## Acknowledgements

**Contributors**:
  * Developed by [Zaid Alyafeai](https://github.com/zaidalyafeai)
  * Additional contributions by [Joey Lee](https://github.com/joeyklee)

**Credits**:
  * UNET 'face' was trained by [Zaid Alyafeai](https://github.com/zaidalyafeai) using [mut1ny - Face/Head segmentation dataset](http://www.mut1ny.com/face-headsegmentation-dataset).

## Source Code

* [/src/UNET/](https://github.com/ml5js/ml5-library/tree/main/src/UNET)
