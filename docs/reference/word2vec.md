# Word2Vec


<center>
    <img style="display:block; max-height:20rem" alt="illustration of an equation with egg plus cat equals kitten" src="_media/reference__header-word2vec.png">
</center>


## Description

Word2vec is a group of related models that are used to produce [word embeddings](https://en.wikipedia.org/wiki/Word2vec)</sup>. This method allows you to perform vector operations on a given set of input vectors.

You can use the word models [we provide](https://github.com/ml5js/ml5-examples/tree/master/p5js/Word2Vec/data), trained on a corpus of english words (watch out for bias data!), or you can train your own vector models following [this tutorial](https://github.com/ml5js/ml5-data-and-training/tree/master/training). More of this soon!

## Quickstart

```js
// Create a new word2vec method
const wordVectors = ml5.word2vec('data/wordvecs.json', modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Find the closest word to 'rainbow'
wordVectors.nearest('rainbow', (err, results) => {
  console.log(results);
});
```


## Usage

### Initialize

```js
const word2vec = ml5.Word2Vec(model, ?callback);
```

#### Parameters
* **model**: A string to the path of the JSON model.
* **callback**: Optional. A callback function that is called once the model has loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.


### Properties



***
#### .ready
> *Boolean*. Boolean value that specifies if the model has loaded.
***

***
#### .model
> *Object*. The model being used.
***


### Methods


***
#### .add()
>  Add a series of word vectors.

```js
word2vec.add(inputs, ?max, ?callback);
```

📥 **Inputs**

* **inputs**: An array of strings containing the inputs to be added
* **max**: Optional. The maximum results to return. Defaults to 1.
* **callback**: Optional. A callback function that is called once the model has made the operation. If no callback is provided, it will return a promise that will be resolved once operation is completed.

📤 **Outputs**

* **Object**: Returns the closest vector of that sum.

***

***
#### .subtract()
> Subtract a series of vectors.

```js
word2vec.subtract(inputs, ?max, ?callback);
```

📥 **Inputs**
* **inputs**: An array of strings containing the inputs to be subtracted.
* **max**: Optional. The maximum results to return. Defaults to 1.
* **callback**: Optional. A callback function that is called once the model has made the operation. If no callback is provided, it will return a promise that will be resolved once operation is completed.

📤 **Outputs**

* **Object**: Returns the closest vector of that sum.

***


***
#### .average()
> Average a series of vectors.

```js
word2vec.average(inputs, ?max, ?callback);
```

📥 **Inputs**
* **inputs**: An array of strings containing the inputs to be averaged.
* **max**: Optional. The maximum results to return. Defaults to 1.
* **callback**: Optional. A callback function that is called once the model has made the operation. If no callback is provided, it will return a promise that will be resolved once operation is completed.

📤 **Outputs**

* **Object**: Returns the closest vector of that average.

***

***
#### .average()
> Average a series of vectors.

```js
word2vec.average(inputs, ?max, ?callback);
```

📥 **Inputs**
* **inputs**: An array of strings containing the inputs to be averaged.
* **max**: Optional. The maximum results to return. Defaults to 1.
* **callback**: Optional. A callback function that is called once the model has made the operation. If no callback is provided, it will return a promise that will be resolved once operation is completed.

📤 **Outputs**

* **Object**: Returns the closest vector of that average.

***


***
##### .nearest()
> Find the nearest vector. Returns `max` array of values.

```js
word2vec.nearest(inputs, ?max, ?callback);
```

📥 **Inputs**
* **input**: The input vector string.
* **max**: Optional. The maximum results to return. Defaults to 10.
* **callback**: Optional. A callback function that is called once the model has made the operation. If no callback is provided, it will return a promise that will be resolved once operation is completed.

📤 **Outputs**

* **Object**: Returns `max` array of values.
***

***
##### .getRandomWord()
>  Find a random vector in the loaded model.

```js
word2vec.getRandomWord(?callback);
```

📥 **Inputs**
* **callback**: Optional. A callback function that is called once the model has made the operation. If no callback is provided, it will return a promise that will be resolved once operation is completed.

📤 **Outputs**

* **String**: Returns a string.
***




## Examples

**p5.js**
* [Word2Vec_Interactive](https://github.com/ml5js/ml5-examples/tree/development/p5js/Word2Vec/Word2Vec_Interactive)

**p5 web editor**
* [Word2Vec_Interactive](https://editor.p5js.org/ml5/sketches/Word2Vec_Interactive)

**plain javascript**
* [Word2Vec_Interactive](https://github.com/ml5js/ml5-examples/tree/development/javascript/Word2Vec/Word2Vec_Interactive)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * Cristobal Valenzuela, Dan Shiffman, and Jenna Xu

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/Word2vec/](https://github.com/ml5js/ml5-library/tree/development/src/Word2vec)
