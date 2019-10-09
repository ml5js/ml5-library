# NeuralNetwork

**currently in development - coming soon to the ml5 release**


<center>
    <img style="display:block; max-height:20rem" alt="neural network placeholder" src="https://via.placeholder.com/150">
</center>


## Description

Create your own neural network and train in the browser with the ml5.neuralNetwork. Collect data to train your neural network or use existing data to train your neural network in real-time. Once it is trained, your neural network and do `classification` or `regression` tasks. 

## Quickstart

```js
// Initialize the the neural network
const neuralNetwork = ml5.neuralNetwork(1, 1);

// add in some data
for(let i = 0; i < 100; i+=1){
    const x = i;
    const y = i * 2;
    neuralNetwork.data.addData( [x], [y])
}

// normalize your data
neuralNetwork.data.normalize();
// train your model
neuralNetwork.train(finishedTraining);

// when it is done training, run .predict()
function finishedTraining(){
    neuralNetwork.predict( [50], (err, results) => {
        console.log(results);
    })
}


```


## Usage

### Initialize

```js
// Option 1: specifying the inputs and outputs with the intention of adding data later
const neuralNetwork = ml5.neuralNetwork(3, 2)
// OR Option 2: specifying the inputs and outputs in an options object
const neuralNetwork = ml5.neuralNetwork(inputsOrOptions)
// OR Option 3: specifying the inputs, outputs, and dataUrl, with a callback
const neuralNetwork = ml5.neuralNetwork(inputsOrOptions, outputsOrCallback)

```

#### Parameters
* **inputsOrOptions**: REQUIRED. An `options` object or a number specifying the number of inputs.
* **outputsOrCallback**: OPTIONAL. A callback to be called after your data is loaded as specified in the `options.dataUrl` or a `number` specifying the number of `outputs`.

The options that can be specified are: 

    ```js
    const DEFAULTS = {
      dataUrl: 'data.csv' // can be a url path or relative path
      task: 'regression',
      activationHidden: 'sigmoid',
      activationOutput: 'sigmoid',
      debug: false,
      learningRate: 0.25,
      inputs: 2, // or the names of the data properties ['temperature', 'precipitation']
      outputs: 1, // or the names of the data properties ['thermalComfort']
      noVal: null,
      hiddenUnits: 1,
      modelMetrics: ['accuracy'],
      modelLoss: 'meanSquaredError',
      modelOptimizer: null,
      batchSize: 64,
      epochs: 32,
  }
    ```

### Properties

***
#### .config
> *Object*: a configuration object that organizes the input options for the model and data. A high level structure of the config object is as follows: {debug, {architecture}, {training}, {dataOptions} }
***
***
#### .vis
> *Object*: allows access to the tf.vis functionality and the `NeuralNetworkVis` object.
***
***
#### .data
> *Object*: allows access to the `NeuralNetworkData` object.
***
***
#### .ready
> *Boolean*: set to true if the model is loaded and ready, false if it is not.
***
***
#### .model
> *Object*: the model. 
***

### Methods

***
#### .normalizeData()
> normalizes the data on a scale from 0 to 1. The data being normalized are part of the `NeuralNetworkData` class which can be accessed in: `neuralNetwork.data.data.raw`

```js
neuralNetwork.normalizeData()
```

📥 **Inputs**

* n/a

📤 **Outputs**

* n/a: normalizes the data in `neuralNetwork.data.data.raw` and adds `inputs` and `output` tensors to `neuralNetwork.data.data.tensor` as well as the `inputMin`, `inputMax`, `outputMin`, and `outputMax` as tensors. The `inputMin`, `inputMax`, `outputMin`, and `outputMax` are also added to `neuralNetwork.data.data` as Numbers. 

***


***
#### .train()
> trains the model with the data loaded during the instantiation of the `NeuralNetwork` or the data added using `neuralNetwork.addData()`

```js
neuralNetwork.train(?optionsOrCallback, ?optionsOrWhileTraining, ?callback)
```

📥 **Inputs**
* **optionsOrCallback**: Optional. 
  * If an object of options is given, then `optionsOrCallback` will be an object where you can specify the `batchSize` and `epochs`:
    ```js
    {batchSize: 24, epochs:32}
    ```
  * If a callback function is given here then this will be a callback that will be called when the training is finished.
    ```js
    function doneTraining(){
      console.log('done!');
    }
    ```
  * If a callback function is given here and a second callback function is given, `optionsOrCallback` will be a callback function that is called after each `epoch` of training, and the `optionsOrWhileTraining` callback function will be a callback function that is called when the training has completed:
    ```js
    function whileTraining(epoch, loss){
      console.log(`epoch: ${epoch}, loss:${loss}`);
    }
    function doneTraining(){
        console.log('done!');
    }
    neuralNetwork.train(whileTraining, doneTraining)
    ```
* **optionsOrWhileTraining**: Optional. 
  * If an object of options is given as the first parameter, then `optionsOrWhileTraining` will be a callback  function that is fired after the training as finished.
  * If a callback function is given as the first parameter to handle the `whileTraining`, then `optionsOrWhileTraining` will be a callback function that is fired after the training as finished.
* **callback**: Optional. Function. 
  * If an object of options is given as the first parameter and a callback function is given as a second parameter, then this `callback` parameter will be a callback function that is fired after the training as finished.
  ```js
  const trainingOptions = {
    batchSize: 32,
    epochs: 12,
  }
  function whileTraining(epoch, loss){
      console.log(`epoch: ${epoch}, loss:${loss}`);
  }
  function doneTraining(){
      console.log('done!');
  }
  neuralNetwork.train(trainingOptions, whileTraining, doneTraining)

  ```

📤 **Outputs**

* n/a: Here, `neuralNetwork.model` is created and the model is trained.

***



***
#### .predict()
> Given an input, will return an array of predictions. 

```js
neuralNetwork.predict(inputs, callback)
```

📥 **Inputs**

* **inputs**: Required. Array | Object.
  * If an array is given, then the input values should match the order that the data are specifed in the `inputs` of the constructor options.
  * If an object is given, then the input values should be given as a key/value pair. The keys must match the keys given in the inputs of the constructor options and/or the keys added when the data were added in `.addData()`.
* **callback**: Required. Function. A function to handle the results of `.predict()`.

📤 **Outputs**

* **Array**: Returns an array of objects. Each object contains `{value, label}`.

***

***
#### .predictMultiple()
> Given an input, will return an array of arrays of predictions. 

```js
neuralNetwork.predictMultiple(inputs, callback)
```

📥 **Inputs**

* **inputs**: Required. Array of arrays | Array of objects.
  * If an array of arrays is given, then the input values of each child array should match the order that the data are specifed in the `inputs` of the constructor options.
  * If an array of objects is given, then the input values of each child object should be given as a key/value pair. The keys must match the keys given in the inputs of the constructor options and/or the keys added when the data were added in `.addData()`.
* **callback**: Required. Function. A function to handle the results of `.predictMultiple()`.

📤 **Outputs**

* **Array**: Returns an array of arrays. Each child array contains objects. Each object contains `{value, label}`.

***

***
#### .classify()
> Given an input, will return an array of classifications. 

```js
neuralNetwork.classify(inputs, callback)
```

📥 **Inputs**

* **inputs**: Required. Array | Object.
  * If an array is given, then the input values should match the order that the data are specifed in the `inputs` of the constructor options.
  * If an object is given, then the input values should be given as a key/value pair. The keys must match the keys given in the inputs of the constructor options and/or the keys added when the data were added in `.addData()`.
* **callback**: Required. Function. A function to handle the results of `.classify()`.

📤 **Outputs**

* **Array**: Returns an array of objects. Each object contains `{label, confidence}`.

***

***
#### .classifyMultiple()
> Given an input, will return an array of arrays of classifications. 

```js
neuralNetwork.classifyMultiple(inputs, callback)
```

📥 **Inputs**

* **inputs**: Required. Array of arrays | Array of objects.
  * If an array of arrays is given, then the input values of each child array should match the order that the data are specifed in the `inputs` of the constructor options.
  * If an array of objects is given, then the input values of each child object should be given as a key/value pair. The keys must match the keys given in the inputs of the constructor options and/or the keys added when the data were added in `.addData()`.
* **callback**: Required. Function. A function to handle the results of `.classifyMultiple()`.

📤 **Outputs**

* **Array**: Returns an array of arrays. Each child array contains objects. Each object contains `{label, confidence}`.

***


***
#### .saveData()
> Given an image, will make objects in the image disappear

```js
classifier.makeDisappear(input, ?numberOfObjects, ?callback)
```

📥 **Inputs**
* **input**: REQUIRED. HTMLImageElement | HTMLVideoElement | ImageData | HTMLCanvasElement. The image or video you want to run the function on.
* **numberOfObjects**: Optional. Number. The number of objects you want to disappear.
* **callback**: Optional. Function. A function to handle the results of `.makeDisappear()`. Likely a function to do something with the results of the image where objects have disappeared.

📤 **Outputs**

* **Image**: Returns an image.

***

***
#### .loadData()
> Given an image, will make objects in the image disappear

```js
classifier.makeDisappear(input, ?numberOfObjects, ?callback)
```

📥 **Inputs**
* **input**: REQUIRED. HTMLImageElement | HTMLVideoElement | ImageData | HTMLCanvasElement. The image or video you want to run the function on.
* **numberOfObjects**: Optional. Number. The number of objects you want to disappear.
* **callback**: Optional. Function. A function to handle the results of `.makeDisappear()`. Likely a function to do something with the results of the image where objects have disappeared.

📤 **Outputs**

* **Image**: Returns an image.

***


***
#### .save()
> Given an image, will make objects in the image disappear

```js
classifier.makeDisappear(input, ?numberOfObjects, ?callback)
```

📥 **Inputs**
* **input**: REQUIRED. HTMLImageElement | HTMLVideoElement | ImageData | HTMLCanvasElement. The image or video you want to run the function on.
* **numberOfObjects**: Optional. Number. The number of objects you want to disappear.
* **callback**: Optional. Function. A function to handle the results of `.makeDisappear()`. Likely a function to do something with the results of the image where objects have disappeared.

📤 **Outputs**

* **Image**: Returns an image.

***

***
#### .load()
> Given an image, will make objects in the image disappear

```js
classifier.makeDisappear(input, ?numberOfObjects, ?callback)
```

📥 **Inputs**
* **input**: REQUIRED. HTMLImageElement | HTMLVideoElement | ImageData | HTMLCanvasElement. The image or video you want to run the function on.
* **numberOfObjects**: Optional. Number. The number of objects you want to disappear.
* **callback**: Optional. Function. A function to handle the results of `.makeDisappear()`. Likely a function to do something with the results of the image where objects have disappeared.

📤 **Outputs**

* **Image**: Returns an image.

***



## Examples

**plain javascript**
* [Example 1]()
* [Example 2]()


**p5.js**
* [Example 1]()
* [Example 2]()

**p5 web editor**
* [Example 1]()
* [Example 2]()

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

* [/src/MagicFeature]()


