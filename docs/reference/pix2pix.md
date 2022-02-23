# Pix2Pix


<center>
    <img style="display:block; max-height:20rem" alt="image of drawing converted to the Pokemon character, Pikachu using Pix2Pix" src="_media/reference__header-pix2pix.png">
</center>

Image: Image of drawing converted to the Pokemon character, Pikachu using Pix2Pix trained on Pikachu images. Trained by [Yining Shi](https://1023.io);

## Description

Image-to-image translation with conditional adversarial nets, or pix2pix, is a machine learning technique developed by
[Isola et al](https://github.com/phillipi/pix2pix) that learns how to map input images to output images.

*The pix2pix model works by training on pairs of images such as building facade labels to building facades, and then attempts to generate the corresponding output image from any input image you give it. [Source](https://affinelayer.com/pixsrv/)*

The original pix2pix TensorFlow implementation was made by [affinelayer](https://github.com/affinelayer/pix2pix-tensorflow).
This version is heavily based on [Christopher Hesse TensorFlow.js implementation](https://github.com/affinelayer/pix2pix-tensorflow/tree/master/server)

## Quickstart

```js
// Create a pix2pix model using a pre trained network
const pix2pix = ml5.pix2pix('models/customModel.pict', modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Transfer using a canvas
pix2pix.transfer(canvas, (err, result) => {
  console.log(result);
});
```


## Usage

### Initialize

```js
const styleTransfer = ml5.pix2pix(model, ?callback);
```

#### Parameters
* **model**: REQUIRED. The path for a valid model.
* **callback**: OPTIONAL. A function to run once the model has been loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.


### Properties

***
#### .ready
> Boolean to check if the model has loaded
***


### Methods


***
#### .transfer()
> Given an canvas element, applies image-to-image translation using the provided model. Returns an image.

```js
styleTransfer.transfer(canvas, ?callback);
```

📥 **Inputs**

* **canvas**: Required. A HTML canvas element.
* **callback**: Optional. A function to run once the model has made the transfer. If no callback is provided, it will return a promise that will be resolved once the model has made the transfer.

📤 **Outputs**

* **Image**: returns an HTMLImageObject

***


## Examples


**p5.js**
* [Pix2Pix_callback](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/Pix2Pix/Pix2Pix_callback)
* [Pix2Pix_promise](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/Pix2Pix/Pix2Pix_promise)

**p5 web editor**
* [Pix2Pix_callback](https://editor.p5js.org/ml5/sketches/Pix2Pix_callback)
* [Pix2Pix_promise](https://editor.p5js.org/ml5/sketches/Pix2Pix_promise)

**plain javascript**
* [Pix2Pix_callback](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/Pix2Pix/Pix2Pix_callback)
* [Pix2Pix_promise](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/Pix2Pix/Pix2Pix_promise)


## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

A nice description of the models overview

#### Pix2Pix - Model Biography

- **Description**
  - This is a pre-trained Pix2Pix model that generates an output image based on a computer-drawn sketch.
- **Developer and Year**
  - According to Yining Shi, who ported the model to ml5 in 2018, the ml5 implementation is based on a TensorFlow model by affinelayer from 2017. TensorFlow is an open source machine learning platform developed by Google. 
  - Follow up: The ml5 description at the top of the reference page states affinelayer’s implementation was based on [Christopher Hesse TensorFlow.js implementation](https://github.com/affinelayer/pix2pix-tensorflow/tree/master/server)
- **Purpose and Intended Users**
  - Generally speaking, and From the website: TensorFlow is an open source machine learning platform that “has a comprehensive, flexible ecosystem of tools, libraries, and community resources that lets researchers push the state-of-the-art in ML and developers easily build and deploy ML-powered applications.”
- **Hosted Location**
  - Hosted by ml5
- **ml5 Contributor and Year**
  - Ported by Yining Shi in 2018.
- **References**
  - Developer and ml5 Contributor [Yining Shi](https://1023.io/)
  - GitHub Repository [Shi’s pix2pix_tensorflowjs](https://github.com/yining1023/pix2pix_tensorflowjs)
  - GitHub Repository [affinelayer’s pix2pix TensorFlow](https://github.com/affinelayer/pix2pix-tensorflow)
  - Website [TensorFlow](https://www.tensorflow.org/)

#### Pix2Pix - Data Biography

- **Description**
  - This demo was trained on images of Pikachu. From Shi’s GitHub Repository, the data consists of “305 images for training and 78 images for testing”.
- **Source**
  - The internet
- **Collector and Year**
  - Shi in 2018
- **Collection Method**
  - Shi scraped them from the internet. In the model’s GitHub repository Shi describes how the images were scraped and processed.
- **Purpose and Intended Users**
  - TBD
- **References**
  - GitHub Repository [Shi’s pix2pix_tensorflowjs](https://github.com/yining1023/pix2pix_tensorflowjs)



## Acknowledgements

**Contributors**:
  * Yining Shi

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

[/src/Pix2pix](https://github.com/ml5js/ml5-library/tree/main/src/Pix2pix)
