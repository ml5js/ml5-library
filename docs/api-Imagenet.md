---
id: imagenet
title: ImageNet
---

You can use neural networks to recognize the content of images. ImageNet is a class to classify an image using a given model.

### Example

```javascript
// Create the classifier
const classifier = new ml5.ImageNet('SqueezeNet');
// Make a prediction
let prediction = classifier.predict(img, function(result){
  console.log(result) 
});
```

## Constructor
  ```javascript
  ImageNet(model)
  ```
  `model` - A String value for a valid deeplearn.js model for image recognition. [`SqueezeNet`](https://github.com/PAIR-code/deeplearnjs/tree/master/models/squeezenet) and [`MobileNet`](https://github.com/PAIR-code/deeplearnjs/tree/master/models/mobilenet) models are available.


## Properties

  ```javascript
  .model
  ```
  > The name of the model used.

  ```javascript
  .ready
  ```
  > Boolean value that specifies if the model has loaded.

  ```javascript
  .math
  ```
  > The environment Math element.

  ```javascript
  .squeezeNet
  ```
  > The [original SqueezNet model](https://github.com/PAIR-code/deeplearnjs/tree/master/models/squeezenet) from deeplearn.js 

## Methods

  ```javascript
  .predict(image, callback)
  ```
  > Given an image, returns an array of objects containing categories and probabilities.

  `image` -  An image element containing valid pixels.

  `callback` - A function to run once the model has made the prediction.

## Static Methods

  ```javascript
  loadModel(model)
  ```
  > Loads a deeplearn.js model.

  `model` - The model to load.

## Source

[/src/ImageNet/index.js](https://github.com/cvalenzuela/ml5/blob/master/src/ImageNet/index.js)
