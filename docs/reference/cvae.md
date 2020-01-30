# CVAE: Condtional Variational Autoencoder


<center>
    <img style="display:block; max-height:20rem" alt="generated images from google quickdraw" src="https://via.placeholder.com/150">
</center>


## Description

An autoencoder is an neural network that learns how to encode data (like the pixels of an image) into a smaller representation. This is akin to image compression (although classic image compression algorithms are better!) A Variational Autoencoder (VAE) takes this idea one step further and is trained generate new images in the style of training data by sprinkling in a little bit of randomness. Conditional Variational Autoencoder (CVAE) is an extension of this idea with the ability to be more specific about what is generated. From [Two Minute Papers](https://www.youtube.com/watch?v=Rdpbnd0pCiI), the author explains that: <br/>

*\"Autoencoders are neural networks that are capable of creating sparse representations of the input data and can therefore be used for image compression. There are denoising autoencoders that after learning these sparse representations, can be presented with noisy images. What is even better is a variant that is called the variational autoencoder that not only learns these sparse representations, but can also draw new images as well. We can, for instance, ask it to create new handwritten digits and we can actually expect the results to make sense!"*


## Quickstart

```js
const cvae = ml5.CVAE('model/quick_draw/manifest.json', modelReady);

function modelReady() {
  // generate an image of an airplane
  cvae.generate('airplane', gotImage);
}

function gotImage(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  // log the result
  console.log(result);
}
```


## Usage

### Initialize

```js
const magic = ml5.CVAE(?model, ?callback);
```

#### Parameters
* **model**: REQUIRED. The url path to your model. Can be an absolute or relative path.
* **callback**: REQUIRED. A function to run once the model has been loaded.


### Properties

***
#### .ready
> *BOOLEAN*. Boolean value that specifies if the model has loaded.
***


### Methods


***
#### .generate(label, callback);
> Given a label, will generate an image.

```js
cvae.generate(label, callback);
```

📥 **Inputs**

* **label**: REQUIRED. String. A label of the feature your want to generate.
* **callback**: REQUIRED. Function. A function to handle the results of ".generate()". Likely a function to do something with the generated image data.

📤 **Outputs**

* **Object**: Returns "raw", "blob", and "tensor". If p5.js is available, a "p5Image" will be returned as well.

***






## Examples

**p5.js**
* [CVAE_QuickDraw](https://github.com/ml5js/ml5-examples/tree/development/p5js/CVAE/CVAE_QuickDraw)

**p5 web editor**
* [CVAE_QuickDraw](https://editor.p5js.org/ml5/sketches/CVAE_QuickDraw)

**plain javascript**
* [CVAE_QuickDraw](https://github.com/ml5js/ml5-examples/tree/development/javascript/CVAE/CVAE_QuickDraw)


## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * Wenhe Li & Dingsu (Derek) Wang

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc


## Source Code

[/src/CVAE/](https://github.com/ml5js/ml5-library/tree/development/src/CVAE)
