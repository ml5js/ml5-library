# DCGAN: Deep Convolutional Generative Adversarial Networks


<center>
    <img style="display:block; max-height:20rem" alt="generated map images" src="_media/reference__header-dcgan.png">
</center>


## Description

You can use neural networks to generate new content. A Generative Adversarial Network (GAN) is a machine learning architecture where two neural networks are adversaries competing. One neural network is a "generator", it makes new images. The other is a "discriminator" and tries to guess if the image is "fake" (made by the generator) or "real" (from the training data). Once the discriminator can no longer guess correctly, the model is trained! A DCGAN is a Deep Convolutional Generative Adversarial Network.

ml5.js provides a few default pre-trained models for DCGAN, but you may consider training your own DCGAN to generate images of things you're interested in.

There are documentation notes on how to train your own DCGAN model for use in ml5.js in the [DCGAN training repo](https://github.com/ml5js/training-dcgan). It should be noted that the setup for this requires knowledge of Python and a general understanding of cloud GPU services. Furthermore, the [ml5js/training-dcgan](https://github.com/ml5js/training-dcgan) repo is not actively maintained. For more up-to-date notes, you might also explore Gene Kogan's [Neural Aesthetic Course at ITP](https://ml4a.github.io/classes/itp-F18/06/#).

## Quickstart

```js
const dcgan = ml5.DCGAN('model/geo/manifest.json', modelReady);

// When the model is loaded
function modelReady() {
  // Generate a new image
  dcgan.generate(gotImage);
}

function gotImage(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  // The generated image is in the result
  console.log(result);
}
```


## Usage

### Initialize

```js
const dcgan = ml5.DCGAN(modelPath, callback);
```

#### Parameters
* **modelPath**: REQUIRED. This will be a JSON object called `manifest.json` that contains information about your pre-trained GAN and the url to the `model.json` file that contains your pre-trained model. The `model` property can also point to an absolute URL e.g. `"https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/dcgan/face/model.json"`

  ```json
  {
    "description": "Aerial Images of Santiago, Chile 64x64 (16 MB)",
    "model": "model/geo/model.json",
    "modelSize": 64,
    "modelLatentDim": 128
  }
  ```
* **callback**: Required. A function to run once the model has been loaded.


### Properties



***
#### .modelReady
> *Boolean*. Boolean value that specifies if the model has loaded.
***


***
#### .model
> *Object*. An object that specifies the model properties
***

***
#### .modelPath
> *String*. The name of the model being used to generate images
***


### Methods


***
#### .generate()
> Given a number, will make magicSparkles

```js
dcgan.generate(callback, ?latentVector);
```

📥 **Inputs**

* **callback**: REQUIRED. Function. A function to handle the results of `.generate()`. Likely a function to do something with the generated image data.
* **latentVector**: OPTIONAL. An array. A vector to explore the latent space of the model. If no latentVector is given, then a random "location" in the latent space is returned.

📤 **Outputs**

* **Object**: Returns "raw", "blob", and "tensor". If p5.js is available, a "p5Image" will be returned as well.

***


## Examples

**p5.js**
* [DCGAN_LatentVector_RandomWalk](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/DCGAN/DCGAN_LatentVector_RandomWalk)
* [DCGAN_LatentVector_Slider](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/DCGAN/DCGAN_LatentVector_Slider)
* [DCGAN_Random](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/DCGAN/DCGAN_Random)

**p5 web editor**
* [DCGAN_LatentVector_RandomWalk](https://editor.p5js.org/ml5/sketches/DCGAN_LatentVector_RandomWalk)
* [DCGAN_LatentVector_Slider](https://editor.p5js.org/ml5/sketches/DCGAN_LatentVector_Slider)
* [DCGAN_Random](https://editor.p5js.org/ml5/sketches/DCGAN_Random)


**plain javascript**
* [DCGAN_Random](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/DCGAN/DCGAN_Random)



## Demo

No demos yet - contribute one today!

## Tutorials

No demos yet - contribute one today!

## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

TBD

#### DCGAN - Model Biography

- **Description**
  - This demonstrates how a pre-trained DCGAN model generates new images, in this case generated images of faces or aerial images of Santiago, Chile. DCGAN stands for deep convolutional generative adversarial networks, a type of neural network architecture.
- **Developer and Year**
  - The DCGAN architecture was introduced in 2015 by researchers from indico Research and Facebook AI. 
  - The ml5 implementation is based on alantian's TensorFlow.js implementation, GAN Showcase. TensorFlow.js, a JavaScript library from TensorFlow, an open source machine learning platform developed by Google.
- **Purpose and Intended Users**
  - Generally speaking, and From the website: TensorFlow is an open source machine learning platform that “has a comprehensive, flexible ecosystem of tools, libraries, and community resources that lets researchers push the state-of-the-art in ML and developers easily build and deploy ML-powered applications.”
- **Hosted Location**
  - Hosted by YG Zhang
- **ml5 Contributor and Year**
  - Ported by YG Zhang, Rui An, and Joey Lee in 2019
- **References**
  - ml5 Contributors [YG Zhang](http://ygzhang.com/), [Rui An](https://frankshammer42.me/), and [Joey Lee](https://github.com/joeyklee)
  - GitHub Repository [Zhang’s DCGAN GitHub Repository](https://github.com/viztopia/ml5dcgan)
  - GitHub Repository [Atlantian’s GAN Showcase](https://github.com/alantian/ganshowcase)
  - Paper [Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks](https://arxiv.org/abs/1511.06434)
  - Website [TensorFlow](https://www.tensorflow.org/)

#### DCGAN - Data Biography

- **Description**
  - The training dataset for the various pretrained DCGAN models come from different sources. The aerial image generator are sourced from Mapbox Satellite. The face generator comes from a Hollywood celebrity dataset.
- **Source**
  - TBD
- **Collector and Year**
  - TBD
- **Collection Method**
  - TBD
- **Purpose and Intended Users**
  - TBD
- **References**
  - ml5 Contributor [Joey Lee](https://github.com/joeyklee)
  - Website [Mapbox Satellite](https://www.mapbox.com/maps/satellite)



## Acknowledgements

**Contributors**:
  * YG Zhang & Rui An
  * Additional contributions by Joey Lee

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc


## Source Code

* [/src/MagicFeature]()
