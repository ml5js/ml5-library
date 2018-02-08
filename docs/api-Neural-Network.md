---
id: neural-network
title: Neural Network
---

Simple Artificial Neural Network, limited to 3 layers.
Based on [Make Your Own Neural Network](https://github.com/makeyourownneuralnetwork/) by Tariq Rashid and [p5 Neural Network](https://github.com/shiffman/Neural-Network-p5) by Daniel Shiffman.

### Example

```javascript
// Create the Neural Network
var knn = new ml5.NeuralNetwork(callback);

// Add two image and Index associate with that image
knn.addImage(imageOne, '1');
knn.addImage(imageTwo, '2');

// Make a prediction. Will return either 1 or 2
knn.predict(video, callback);
```

## Constructor
  ```javascript
  NeuralNetwork(inputNodes, hiddenNodes, outputNodes, ?learningRate)
  ```
  `inputNodes` - Amount of input nodes.

  `hiddenNodes` - Amount of hidden nodes.
  
  `outputNodes` - Amount of output nodes.

  `learningRate` - Learning Rate. Optional. Defaults to 0.1.

## Properties

  ```javascript
  .iNodes
  ```
  > Amount of input nodes.

  ```javascript
  .hNodes
  ```
  > Amount of hidden nodes.

  ```javascript
  .oNodes
  ```
  > Amount of output nodes.

  ```javascript
  .wih
  ```
  > Input to Hidden weights.

  ```javascript
  .who
  ```
  > Hidden to Output weights.

  ```javascript
  .learningRate
  ```
  > Learning Rate

  ```javascript
  .math
  ```
  > The environment Math element.

## Methods

  ```javascript
  .train(input, target)
  ```
  > Trains the Neural Network.

  `input` - The input array.

  `target` - The target value of the input array.


  ```javascript
  .query(input)
  ```
  > Query the Neural Network based on the input and predicts an output. Returns ...

  `input` -  The input array.

## Source

[/src/NeuralNetwork/index.js](https://github.com/cvalenzuela/ml5/blob/master/src/NeuralNetwork/index.js)