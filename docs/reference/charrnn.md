# CharRNN


<center>
    <img style="display:block; max-height:20rem" alt="image of book with text that says, 'you are designing for humans not machines'" src="_media/reference__header-charrnn.png">
</center>


## Description

RNN and LSTMs (Long Short Term Memory networks) are a type of Neural Network architecture useful for working with sequential data (like characters in text or the musical notes of a song) where the order of the that sequence matters. This class allows you run a model pre-trained on a body of text to generate new text.

You can train your own models [following the instructions in the training-charRNN repo](https://github.com/ml5js/training-charRNN). There is also a selection of [pre-trained model examples available](https://github.com/ml5js/ml5-data-and-models/tree/main/models/charRNN).

## Quickstart

```js
// Create the character level generator with a pre trained model
const rnn = ml5.charRNN('models/bolaño/', modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Generate content
rnn.generate({ seed: 'the meaning of pizza is' }, (err, results) => {
  console.log(results);
});
```


## Usage

### Initialize

```js
const charrnn = ml5.charRNN(model, ?callback);
```

#### Parameters
* **model**: REQUIRED. An absolute or relative path to the charRNN model files.
* **callback**: OPTIONAL. A callback to be called once the model has loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.

### Properties


***
#### .ready
> Boolean value that specifies if the model has loaded.
***

***
#### .state
> The current state of the model.
***

***
#### .model
> The pre-trained charRNN model.
***

***
#### .vocabSize
> The vocabulary size (or total number of possible characters).
***


### Methods


***
#### .generate()
> Generates content in a stateless manner, based on some initial text (known as a "seed"). Returns a string.

```js
charrnn.generate(options, ?callback);
```

📥 **Inputs**

* **options**: REQUIRED. An object specifying the input parameters of seed, length and temperature. Default length is 20, temperature is 0.5 and seed is a random character from the model. The object should look like this
  ```js
  {
    seed: 'The meaning of pizza is',
    length: 20,
    temperature: 0.5,
  };
  ```
* **callback**: Optional. Function. A function to be called when the model has generated content. If no callback is provided, it will return a promise that will be resolved once the model has generated new content.

📤 **Outputs**

* **Object**: Returns an object. {sample: generated,state: this.state}.

***


***
#### .predict()
> Feed a string of characters to the model state.

```js
charrnn.predict(temperature, ?callback);
```

📥 **Inputs**
* **seed**: REQUIRED. Predict the next character based on the model's current state.
* **callback**: Optional. Function. A function to be called when the model finished adding the seed. If no callback is provided, it will return a promise that will be resolved once the prediction has been generated.

📤 **Outputs**

* **Object**: Returns an object `{sample, probabilities}`;

***

***
#### .feed()
> Given an image, will make objects in the image disappear

```js
charrnn.feed(seed, ?callback);
```

📥 **Inputs**
* **seed**: REQUIRED. A string to feed the charRNN model state.
* **callback**: Optional. Function.Optional. A function to be called when the model finished adding the seed. If no callback is provided, it will return a promise that will be resolved once seed has been fed..

📤 **Outputs**

* **Image**: Returns an image.

***

***
#### .reset()
> Reset the model state

```js
charrnn.reset();
```

📥 **Inputs**
* none

📤 **Outputs**

* none

***


## Examples

**p5.js**
* [CharRNN_Interactive](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/CharRNN/CharRNN_Interactive)
* [CharRNN_Text](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/CharRNN/CharRNN_Text)
* [CharRNN_Text_Stateful](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/CharRNN/CharRNN_Text_Stateful)

**p5 web editor**

Please be advised, that due to an incompatibility of the p5 web-editor and the weights that are used in this example, this example does not work in the p5 we-editor. 
Please use the p5.js example locally. Learn more about how to run examples locally [here.](https://github.com/ml5js/ml5-library/blob/main/examples/README.md#setup)
<!-- * [CharRNN_Interactive](https://editor.p5js.org/ml5/sketches/CharRNN_Interactive)
* [CharRNN_Text](https://editor.p5js.org/ml5/sketches/CharRNN_Text)
* [CharRNN_Text_Stateful](https://editor.p5js.org/ml5/sketches/CharRNN_Text_Stateful) -->

**plain javascript**
* [CharRNN_Interactive](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/CharRNN/CharRNN_Interactive)
* [CharRNN_Text](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/CharRNN/CharRNN_Text)
* [CharRNN_Text_Stateful](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/CharRNN/CharRNN_Text_Stateful)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

TBD

#### CharRNN - Model Biography

- **Description**
  - This is a type of neural network architecture for working with pre-trained models, and several example models are provided by ml5.
- **Developer and Year**
  - From the model training tutorial, the ml5 implementation is based on Sherjil Ozair’s char-rnn-tensorflow, which is inspired by Adrej Karpathy’s work in this area from 2015.
- **Purpose and Intended Users**
  - TBD
- **Hosted Location**
  - ml5
- **ml5 Contributor and Year**
  - Ported by Cristóbal Valenzuela with additional contributions from Memo Akten in 2018.
- **References**
  - Developers and ml5 Contributors [Cristóbal Valenzuela](https://cvalenzuelab.com/) and [Memo Akten](http://www.memo.tv/works/)
  - ml5 [Pre-trained Models](https://github.com/ml5js/ml5-data-and-models/tree/master/models/lstm)
  - ml5 Tutorial [Training a charRNN and using the model in ml5js](https://github.com/ml5js/training-charRNN)
  - GitHub Repository [Sherjil Ozair’s char-rnn-tensorflow](https://github.com/sherjilozair/char-rnn-tensorflow)
  - Article [The Unreasonable Effectiveness of Recurrent Neural Networks by Adrej Karpathy](http://karpathy.github.io/2015/05/21/rnn-effectiveness/)

#### CharRNN - Data Biography

- **Description**
  - Users train a charRNN model on their own corpus.
- **Source**
  - ml5 also supplies some sample datasets on which to train a CharRNN model, compiled from public domains texts from Project Gutenberg
- **Collector and Year**
  - Starting in 2018, a number of contributors added sample datasets.
- **Collection Method**
  - TBD
- **Purpose and Intended Users**
  - TBD
- **References**
  - ml5 [Sample Datasets](https://github.com/ml5js/ml5-data-and-models/tree/master/datasets/text)
  - Article [ml5: Friendly Open Source Machine Learning Library for the Web](https://medium.com/ml5js/ml5-friendly-open-source-machine-learning-library-for-the-web-e802b5da3b2)
  - Website [Project Gutenberg](http://www.gutenberg.org/)

## Acknowledgements

**Contributors**:
  * Cristobal Valenzuela and Memo Atken

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/CharRnn]()
