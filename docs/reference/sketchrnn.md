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
* [SketchRNN_basic](https://github.com/ml5js/ml5-examples/tree/development/p5js/SketchRNN/SketchRNN_basic)
* [SketchRNN_interactive](https://github.com/ml5js/ml5-examples/tree/development/p5js/SketchRNN/SketchRNN_interactive)

**p5 web editor**
* [SketchRNN_basic](https://editor.p5js.org/ml5/sketches/SketchRNN_basic)
* [SketchRNN_interactive](https://editor.p5js.org/ml5/sketches/SketchRNN_interactive)

**plain javascript**
* [SketchRNN_basic](https://github.com/ml5js/ml5-examples/tree/development/javascript/SketchRNN/_basic)
* [SketchRNN_interactive](https://github.com/ml5js/ml5-examples/tree/development/javascript/SketchRNN/SketchRNN_interactive)


## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Acknowledgements

**Contributors**:
  * Name 1
  * Name 2

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc



## Source Code

* [/src/SketchRNN/](https://github.com/ml5js/ml5-library/tree/development/src/SketchRNN)
