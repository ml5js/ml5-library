# SketchRnn


<center>
    <img style="display:block; max-height:20rem" alt="AI generated cat drawings" src="_media/reference__header-sketchrnn.png">
</center>


## Description

SketchRNN is a recurrent neural network model trained on millions of doodles collected from the [Quick, Draw! game](https://quickdraw.withgoogle.com/). The SketchRNN model can create new drawings (from a list of categories) based on an initial path.

This original paper and implementation of SketchRNN was made in TensorFlow and ported to [Magenta.js](https://magenta.tensorflow.org/get-started/#magenta-js) by [David Ha](https://twitter.com/hardmaru). The ml5.js implementation was ported by [Reiichiro Nakano](https://github.com/reiinakano).

The ml5 library includes [a list of supported SketchRNN models](https://github.com/ml5js/ml5-library/blob/master/src/SketchRNN/models.js).

## Quickstart

```js
// Create a new SketchRNN Instance
const model = ml5.sketchRNN('cat', modelReady);

// When the model is loaded
function modelReady() {
  console.log('SketchRNN Model Loaded!');
}
// Reset the model's current stat
model.reset();
// Generate a new stroke
model.generate(gotSketch);

function gotSketch(err, result) {
  // Do something with the result
}
```


## Usage

### Initialize

```js
const sketchrnn = ml5.sketchRNN(model, ?callback);
```

#### Parameters
* **model**: The name of the model to use.
* **callback**: Optional. A function to be called once the model is loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.

### Properties

***
#### .ready
> *Boolean*. Boolean value that specifies if the model has loaded.
***


### Methods


***
#### .reset()
> Reset the model's current state

```js
sketchrnn.reset();
```

📥 **Inputs**

* n/a

📤 **Outputs**

* n/a

***



<!-- /////////////////////
FUNCTION DEFINITION START
///////////////////////// -->
***
#### .generate()
> Generates a new sample with the current state.

```js
sketchrnn.generate(?seed, ?options, ?callback);
```

📥 **Inputs**
* **seed**: Optional. A seed to be passed to the model before generating a new stroke.
* **options**: Optional. An object describing the options of the model.
* **callback**: Optional. A function that will return a generated stroke. If no callback is provided, it will return a promise that will be resolved with a generated stroke.

📤 **Outputs**

* **Object**: an object with the x and y location, if the pen is down, up, or if it has ended `{s.dx, s.dy, down, up, end}`.

***





## Examples

**p5.js**
* [SketchRNN_basic](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/SketchRNN/SketchRNN_basic)
* [SketchRNN_interactive](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/SketchRNN/SketchRNN_interactive)

**p5 web editor**
* [SketchRNN_basic](https://editor.p5js.org/ml5/sketches/SketchRNN_basic)
* [SketchRNN_interactive](https://editor.p5js.org/ml5/sketches/SketchRNN_interactive)

**plain javascript**
* [SketchRNN_basic](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/SketchRNN/_basic)
* [SketchRNN_interactive](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/SketchRNN/SketchRNN_interactive)


## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

A nice description of the models overview

#### SketchRNN - Model Biography

- **Description**
  - SketchRNN provides access to 114 pre-trained models to generate images from the input of your digital line drawings.
- **Developer and Year**
  - The original implementation of SketchRNN was created by Google Brain researchers, David Ha and Douglas Eck, as part of the open source research project, Magenta. It was built in TensorFlow and ported to Magenta.js in 2017.
- **Purpose and Intended Users**
  - From the paper, SketchRNN was developed to “train machines to draw and generalize abstract concepts in a manner similar to humans,” and by doing so, create a tool with many potential applications, such as assisting the creative processes of artists and designers and possibly helping people learn to draw. It is available for use in the ml5 library because Majenta.js uses the Apache 2.0 license.
- **Hosted Location**
  - The pre-trained SketchRNN models available in ml5 are hosted by Google.
- **ml5 Contributor and Year**
  - Ported by Reiichiro Nakano in 2018
- **References**
  - ml5 Contributor [Reiichiro Nakano](https://github.com/reiinakano)
  - Article [Teaching Machines to Draw](https://ai.googleblog.com/2017/04/teaching-machines-to-draw.html)
  - Paper [A Neural Representation of Sketch Drawings](https://arxiv.org/abs/1704.03477)
  - Website [Magenta: Make Music and Art using Machine Learning](https://magenta.tensorflow.org/)
  - Website [Magenta.js SketchRNN Documentation](https://magenta.github.io/magenta-js/sketch/)
  - GitHub Repository [Magenta.js SketchRNN](https://github.com/magenta/magenta-js/tree/master/sketch)

#### SketchRNN - Data Biography

- **Description**
  - SketchRNN’s developers created a dataset of vector hand-drawn sketches. Their paper explains that “QuickDraw consists of hundreds of classes of common objects. Each class of QuickDraw is a dataset of 70K training samples, in addition to 2.5K validation and 2.5K test samples. We use a data format that represents a sketch as a set of pen stroke actions,” such as “which direction to move, when to lift the pen up, and when to stop drawing.”
- **Source**
  - Google’s Quick, Draw! Dataset
- **Collector and Year**
  - From the website: Google released the Quick, Draw! game in 2016 and was developed as “an example of how you can use machine learning in fun ways” by the Google Creative Lab, Data Arts Team, and their collaborators as part of Google’s AI Experiments showcase.
- **Collection Method**
  - The sketches are crowdsourced from visitors’ contributions as they play Google’s Quick, Draw! Game, and they are publicly available to download.
- **Purpose and Intended Users**
  - According to the paper, the dataset is publicly available “to encourage further research and development in the area of generative vector image modelling.”
- **References**
  - Paper [A Neural Representation of Sketch Drawings](https://arxiv.org/abs/1704.03477)
  - Website [Google’s Quick, Draw!](https://quickdraw.withgoogle.com/#)
  - Website [Quick, Draw! The Data](https://quickdraw.withgoogle.com/data)





## Acknowledgements

**Contributors**:
  * Name 1
  * Name 2

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc



## Source Code

* [/src/SketchRNN/](https://github.com/ml5js/ml5-library/tree/main/src/SketchRNN)
