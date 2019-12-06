# DCGAN: Deep Convolutional Generative Adversarial Networks


<center>
    <img style="display:block; max-height:20rem" alt="generated map images" src="_media/reference__header-dcgan.png">
</center>


## Description

You can use neural networks to generate new content. A Generative Adversarial Network (GAN) is a machine learning architecture where two neural networks are adversaries competing. One neural network is a "generator", it makes new images. The other is a "discriminator" and tries to guess if the image is "fake" (made by the generator) or "real" (from the training data). Once the discriminator can no longer guess correctly, the model is trained! A DCGAN is a Deep Convolutional Generative Adversarial Network.

ml5.js provides a few default pre-trained models for DCGAN, but you may consider training your own DCGAN to generate images of things you're interested in.
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
* [DCGAN_LatentVector](https://github.com/ml5js/ml5-examples/tree/development/p5js/DCGAN/DCGAN_LatentVector)
* [DCGAN_LatentVector_RandomWalk](https://github.com/ml5js/ml5-examples/tree/development/p5js/DCGAN/DCGAN_LatentVector_RandomWalk)
* [DCGAN_LatentVector_Slider](https://github.com/ml5js/ml5-examples/tree/development/p5js/DCGAN/DCGAN_LatentVector_Slider)
* [DCGAN_Random](https://github.com/ml5js/ml5-examples/tree/development/p5js/DCGAN/DCGAN_Random)

**p5 web editor**
* [DCGAN_LatentVector](https://editor.p5js.org/ml5/sketches/DCGAN_LatentVector)
* [DCGAN_LatentVector_RandomWalk](https://editor.p5js.org/ml5/sketches/DCGAN_LatentVector_RandomWalk)
* [DCGAN_LatentVector_Slider](https://editor.p5js.org/ml5/sketches/DCGAN_LatentVector_Slider)
* [DCGAN_Random](https://editor.p5js.org/ml5/sketches/DCGAN_Random)


**plain javascript**
* [DCGAN_LatentVector](https://github.com/ml5js/ml5-examples/tree/development/javascript/DCGAN/DCGAN_LatentVector)
* [DCGAN_LatentVector_RandomWalk](https://github.com/ml5js/ml5-examples/tree/development/javascript/DCGAN/DCGAN_LatentVector_RandomWalk)
* [DCGAN_LatentVector_Slider](https://github.com/ml5js/ml5-examples/tree/development/javascript/DCGAN/DCGAN_LatentVector_Slider)
* [DCGAN_Random](https://github.com/ml5js/ml5-examples/tree/development/javascript/DCGAN/DCGAN_Random)



## Demo

No demos yet - contribute one today!

## Tutorials

No demos yet - contribute one today!

## Acknowledgements

**Contributors**:
  * YG Zhang & Rui An
  * Additional contributions by Joey Lee

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc


## Source Code

* [/src/MagicFeature]()
