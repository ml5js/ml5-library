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
> *Object*: the tf model. 
***

### Methods


***
#### .normalizeData()
> Given a number, will make magicSparkles

```js
classifier.makeSparkles(?numberOfSparkles, ?callback)
```

📥 **Inputs**

* **numberOfSparkles**: Optional. Number. The number of sparkles you want to return.
* **callback**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Object**: Returns an array of objects. Each object contains `{something, anotherThing}`.

***


***
#### .train()
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
#### .predict()
> Given a number, will make magicSparkles

```js
classifier.makeSparkles(?numberOfSparkles, ?callback)
```

📥 **Inputs**

* **numberOfSparkles**: Optional. Number. The number of sparkles you want to return.
* **callback**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Object**: Returns an array of objects. Each object contains `{something, anotherThing}`.

***

***
#### .predictMultiple()
> Given a number, will make magicSparkles

```js
classifier.makeSparkles(?numberOfSparkles, ?callback)
```

📥 **Inputs**

* **numberOfSparkles**: Optional. Number. The number of sparkles you want to return.
* **callback**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Object**: Returns an array of objects. Each object contains `{something, anotherThing}`.

***

***
#### .classify()
> Given a number, will make magicSparkles

```js
classifier.makeSparkles(?numberOfSparkles, ?callback)
```

📥 **Inputs**

* **numberOfSparkles**: Optional. Number. The number of sparkles you want to return.
* **callback**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Object**: Returns an array of objects. Each object contains `{something, anotherThing}`.

***

***
#### .classifyMultiple()
> Given a number, will make magicSparkles

```js
classifier.makeSparkles(?numberOfSparkles, ?callback)
```

📥 **Inputs**

* **numberOfSparkles**: Optional. Number. The number of sparkles you want to return.
* **callback**: Optional. Function. A function to handle the results of `.makeSparkles()`. Likely a function to do something with the results of makeSparkles.

📤 **Outputs**

* **Object**: Returns an array of objects. Each object contains `{something, anotherThing}`.

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


