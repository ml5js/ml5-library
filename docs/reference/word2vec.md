# Word2Vec


<center>
    <img style="display:block; max-height:20rem" alt="illustration of an equation with egg plus cat equals kitten" src="_media/reference__header-word2vec.png">
</center>

## word2vec has been disabled
We've intentionally disabled the word2vec function after recognizing it has the potential to produce harmful outputs while using the pre-trained model files included in our examples. We'll consider reenabling the word2vec function along with changes to address these issues in a future release of ml5.js. You can find further updates about this topic on the [Twitter account](https://twitter.com/ml5js/status/1445762321444315147) and [GitHub](https://github.com/ml5js/ml5-library/issues/1238).

---
## Description

Word2vec is a group of related models that are used to produce [word embeddings](https://en.wikipedia.org/wiki/Word2vec)</sup>. This method allows you to perform vector operations on a given set of input vectors.

You can use the word models [we provide](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/Word2Vec/Word2Vec_Interactive/data), trained on a corpus of english words (watch out for bias data!), or you can train your own vector models following [this tutorial](https://github.com/ml5js/ml5-data-and-training/tree/master/training). More of this soon!

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
##### .nearestFromSet()
> Given an input word, this function finds the nearest word in given a set of words in an array. This allows you to answer a question like, "of these three animals--dog, cat, and mouse--which of them is closest to a skunk?" In this case the set would be ['dog', 'cat', 'mouse'] and the input word would be 'skunk'.

```js
word2vec.nearestFromSet(input, set, maxOrCb, cb);
```

📥 **Inputs**
* **input**: The input vector string.
* **set**: An array of words you would like test your input against.
* **maxOrCb**: Optional. The maximum results to return. Defaults to 10.
* **cb**: Optional. A callback function that is called once the model has made the operation. If no callback is provided, it will return a promise that will be resolved once operation is completed.

📤 **Outputs**

* **Object**: Returns `max` array of values.

**Example 1**
```js
const results = await word2vecInstance.nearestFromSet('human', ['cat', 'ape', 'lamp'], 1);

// results is {word: "cat", distance: 0.91829} 
```
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
* [Word2Vec_Interactive](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/Word2Vec/Word2Vec_Interactive)

**p5 web editor**
* [Word2Vec_Interactive](https://editor.p5js.org/ml5/sketches/Word2Vec_Interactive)

**plain javascript**
* [Word2Vec_Interactive](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/Word2Vec/Word2Vec_Interactive)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

A nice description of the models overview

#### Word2Vec - Model Biography

- **Description**
  - TBD
- **Developer and Year**
  - This ml5 implementation is based on Daniel Shiffman’s 2017 p5.js Word2Vec, who in turn credits both Allison Parrish and Anthony Liu.
- **Purpose and Intended Users**
  - TBD
- **Hosted Location**
  - Hosted by ml5
- **ml5 Contributor and Year**
  - Ported by Cristóbal Valenzuela in 2018
- **References**
  - Developer [Daniel Shiffman](https://shiffman.net/)
  - ml5 Contributor [Cristóbal Valenzuela](https://cvalenzuelab.com/)
  - GitHub Repository [Daniel Shiffman’s p5.js Word2Vec](https://github.com/shiffman/p5-word2vec)
  - GitHub Gist [Allison Parrish’s Understanding Word Vectors](https://gist.github.com/aparrish/2f562e3737544cf29aaf1af30362f469)
  - GitHub Repository [Anthony Liu’s word2vecjson](https://github.com/turbomaze/word2vecjson)

#### Word2Vec - Data Biography

- **Description**
  - You can train your own vector model or use sample data provided by ml5, which are the same as those provided by Anthony Liu.
- **Source**
  - TBD
- **Collector and Year**
  - TBD
- **Collection Method**
  - TBD
- **Purpose and Intended Users**
  - TBD
- **References**
  - Article [ml5: Friendly Open Source Machine Learning Library for the Web](https://medium.com/ml5js/ml5-friendly-open-source-machine-learning-library-for-the-web-e802b5da3b2)
  - GitHub Repository [Daniel Shiffman’s p5.js Word2Vec](https://github.com/shiffman/p5-word2vec)
  - GitHub Repository [Anthony Liu’s word2vecjson](https://github.com/turbomaze/word2vecjson)




## Acknowledgements

**Contributors**:
  * Cristobal Valenzuela, Dan Shiffman, and Jenna Xu

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/Word2vec/](https://github.com/ml5js/ml5-library/tree/main/src/Word2vec)
