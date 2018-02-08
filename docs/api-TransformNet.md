---
id: transform-net
title: Transform Net
---

This class allows you to perform the Fast Neural Style Transfer algorithm on any given image. You need to provide a valid pre-trained and ported model. 

Based on [this demo](https://github.com/PAIR-code/deeplearnjs/tree/0608feadbd897bca6ec7abf3340515fe5f2de1c2/demos/fast-style-transfer)
and [fast-style-transfer-deeplearnjs](https://github.com/reiinakano/fast-style-transfer-deeplearnjs) by reiinakano.

The original Tensorflow version of model can be found [here](https://github.com/lengstrom/fast-style-transfer).

### Example

```javascript
// Create a new Fast Style Transfer (fst) instance
const fst = new ml5.TransformNet('data/myModel/');

// Grab a <img> element and generate a new image.
const img = document.getElementById('input');
let outputImgData = fst.predict(img);
```

## Constructor
  ```javascript
  TransformNet(model, callback)
  ```
  `model` - A valid Fast Style Transfer model that has been ported to deeplearn.js
  `callback` - A function to execute once the model is loaded.

## Properties

  ```javascript
  .ready
  ```
  > Boolean value that specifies if the model has loaded.

  ```javascript
  .variableDictionary
  ```
  > 

  ```javascript
  .timesScalar
  ```
  > 

  ```javascript
  .plusScalar
  ```
  > 

  ```javascript
  .epsilonScalar
  ```
  > 

  ```javascript
  .math
  ```
  > The environment Math element.

## Methods

  ```javascript
  .predict(img)
  ```
  > Infer through TransformNet, assumes variables have been loaded. Returns an Array3D containing pixels of the output img.

  `img` -  HTMLImageElement of input img

  ```javascript
  .loadCheckpoints(path)
  ```
  > Loads the corresponding checkpoints of the model. This method is run when constructing the class.

  `path` - Model path

## Source

[/src/Lstm/index.js](https://github.com/ITPNYU/ml5/tree/master/src/TransformNet)