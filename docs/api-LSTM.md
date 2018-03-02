---
id: lstm
title: LSTM
---

[LSTMs](https://colah.github.io/posts/2015-08-Understanding-LSTMs/) (Long Short Term Memory networks) are a kind of Neural Network architecture useful for working with series of data where the order of the series matters. This class allows you run a pre-trained model 
through inference mode and generate new content. 

You can train your own models [using this tutorial](training-LSTM.md) or used [this set of pretrained models](https://github.com/ITPNYU/ml5/tree/master/training/lstm)

### Example

```javascript
// The input options to use
const options = {
  seed: 'She was sitting next to',
  length: 20,
  temperature: 0.6
}

// Create the LSTM using a pretrained model.
const lstm = new ml5.LSTM('./data/hemingway/');

// Generete content
lstm.generate(options, function(output){
  console.log(output)
});
```

## Constructor
  ```javascript
  LSTMGenerator(model)
  ```
  `model` - A valid LSTM model that has been ported.

## Properties

  ```javascript
  .ready
  ```
  > Boolean value that specifies if the model has loaded.

  ```javascript
  .model
  ```
  > The model architecture.

  ```javascript
  .cellsAmount
  ```
  > Amount of cells in the model.

  ```javascript
  .vocab
  ```
  > The total vocabulary of the model. (unique characters in the source text)

  ```javascript
  .vocabSize
  ```
  > The size vocabulary.

  ```javascript
  .math
  ```
  > The environment Math element.

  ```javascript
  .defaults
  ```
  > The default seed, length and temperature if none are passed when generating. Defaults to `{ seed: 'a', length: 20, temperature: 0.5}`.

## Methods

  ```javascript
  .generate(options, callback)
  ```
  > Generates content based on the seed given. Returns ...

  `options` -  An object specifying the input parameters of seed, length and temperature. Defaults to `{ seed: 'a', length: 20, temperature: 0.5}`.

  `callback` - A function to be called once the model has generated content.

  ```javascript
  .loadCheckpoints(path)
  ```
  > Loads the corresponding checkpoints of the model. This method is run when constructing the class.

  `path` - The model to load.

  ```javascript
  .loadVocab(path)
  ```
  > Loads the corresponding vocabulary of the model. This method is run when constructing the class.

  `path` - The model to load.
  
## Source

[/src/Lstm/index.js](https://github.com/ITPNYU/ml5/blob/master/src/Lstm/index.js)
