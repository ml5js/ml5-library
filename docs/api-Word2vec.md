---
id: word2vec
title: Word2Vec
---

Word2vec is a group of related models that are used to produce word embeddings<sup>[1](https://en.wikipedia.org/wiki/Word2vec)</sup>. This class allows you to perform vector operations on a given set of input vectors. You can use the pre-trained word models or you can train your own vector models following [this tutorial](#).

### Example

```javascript
// Create the classifier
const wordVectors = new p5ml.Word2Vec('data/wordvecs10000.json');

// Find the closest word to 'rainbow'
const nearest = wordVectors.nearest('rainbow', 1);

// Find the average of two words
const average = wordVectors.average(['red', 'green'], 1); // Should output yellow
```

## Constructor
  ```javascript
  Word2Vec(vectors)
  ```
  > `vectors` - A JSON file containing valid vectors of N-dimension.

## Properties

  ```javascript
  .ready
  ```
  > Boolean value that specifies if the model has loaded.

  ```javascript
  .model
  ```
  > The model being used.

  ```javascript
  .modelSize
  ```
  > The size of the model being used.

  ```javascript
  .math
  ```
  > The environment Math element.

## Methods

  ```javascript
  .add(inputs, max)
  ```
  > Add a series of vectors. Returns the closest vector of that sum.

  > `inputs` - An array of strings containing the inputs to be added

  > `max` - The maximum results to return. Optional. Defaults to 1.


  ```javascript
  .subtract(inputs, max)
  ```
  > Subtract a series of vectors. Returns the closest vector of that sum.

  > `inputs` - An array of strings containing the inputs to be subtracted.

  > `max` - The maximum results to return. Optional. Defaults to 1.


  ```javascript
  .average(inputs, max)
  ```
  > Average a series of vectors. Returns the closest vector of that average.

  > `inputs` - An array of strings containing the inputs to be averaged.

  > `max` - The maximum results to return. Optional. Defaults to 1.

  ```javascript
  .nearest(index)
  ```
  > Clears a class associated with an index.

## Static Methods

  ```javascript
  addOrSubtract(model)
  ```
  > Utility method to add or subtract vectors.

  ```javascript
  nearest(model)
  ```
  > Finds the n-closest neighbors of a vector.

## Source

[/src/Word2vec/index.js](https://github.com/ITPNYU/p5-deeplearn-js/blob/master/src/Word2vec/index.js)