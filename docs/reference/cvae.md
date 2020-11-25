# CVAE: Conditional Variational Autoencoder


<center>
    <img style="display:block; max-height:20rem" alt="generated images from google quickdraw" src="https://via.placeholder.com/150">
</center>


## Description

An autoencoder is an neural network that learns how to encode data (like the pixels of an image) into a smaller representation. This is akin to image compression (although classic image compression algorithms are better!) A Variational Autoencoder (VAE) takes this idea one step further and is trained to generate new images in the style of training data by sprinkling in a little bit of randomness. Conditional Variational Autoencoder (CVAE) is an extension of this idea, with the ability to be more specific about what is generated. From [Two Minute Papers](https://www.youtube.com/watch?v=Rdpbnd0pCiI), the author explains that: <br/>

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
* [CVAE_QuickDraw](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/CVAE/CVAE_QuickDraw)

**p5 web editor**
* [CVAE_QuickDraw](https://editor.p5js.org/ml5/sketches/CVAE_QuickDraw)

**plain javascript**
* [CVAE_QuickDraw](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/CVAE/CVAE_QuickDraw)


## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

TBD

#### CVAE - Model Biography

- **Description**
  - CVAE stands for Conditional  variational auto-encoder, a type of neural network architecture.
- **Developer and Year**
  - CVAE was developed by researchers from NEC Laboratories America, Inc. and the University of Michigan, Ann Arbor, in 2015.
- **Purpose and Intended Users**
  - TBD
- **Hosted Location**
  - Hosted by ml5
- **ml5 Contributor and Year**
  - Ported by Wenhe Eric Li in 2019
- **References**
  - ml5 Contributor [Wenhe Eric Li](https://portfolio.steins.live/)
  - Paper [Learning Structured Output Representation using Deep Conditional Generative Models](https://pdfs.semanticscholar.org/3f25/e17eb717e5894e0404ea634451332f85d287.pdf)
  - Website [Neural Information Processing Systems Conference Proceedings](https://papers.nips.cc/paper/5775-learning-structured-output-representation-using-deep-conditional-generative-models')

#### CVAE - Data Biography

- **Description**
  - You provide images for training the model from Google’s Google’s Quick, Draw! Dataset. See Dingsu (Derek) Wang’s tutorial in the ml5 GitHub repository on how to train a ml5 CVAE model using your own dataset from that source. 
- **Source**
  - Google’s Quick, Draw! Dataset
- **Collector and Year**
  - From the website: Google released the Quick, Draw! game in 2016 and was developed as “an example of how you can use machine learning in fun ways” by the Google Creative Lab, Data Arts Team, and their collaborators as part of Google’s AI Experiments showcase.
- **Collection Method**
  - The sketches are crowdsourced from visitors’ contributions as they play Google’s Quick, Draw! Game, and they are publicly available to download.
- **Purpose and Intended Users**
  - According to the paper, the dataset is publicly available “to encourage further research and development in the area of generative vector image modelling.”
- **References**
  - Website [Google’s Quick, Draw!](https://quickdraw.withgoogle.com/#)
  - Website [Quick, Draw! The Data](https://quickdraw.withgoogle.com/data)
  - GitHub Repository [ml5 Training CVAE Tutorial by Dingsu (Derek) Wang](https://github.com/ml5js/training_CVAE)




## Acknowledgements

**Contributors**:
  * Wenhe Li & Dingsu (Derek) Wang

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc


## Source Code

[/src/CVAE/](https://github.com/ml5js/ml5-library/tree/main/src/CVAE)
