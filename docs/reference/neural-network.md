# NeuralNetwork

**currently in development - coming soon to the ml5 release**


<center>
    <img style="display:block; max-height:20rem" alt="Illustration of brain" src="_media/reference__header-neural-network.png">
</center>


## Description

Create your own neural network and train in the browser with the ml5.neuralNetwork. Collect data to train your neural network or use existing data to train your neural network in real-time. Once it is trained, your neural network and do `classification` or `regression` tasks.

## Quickstart

```js
// Initialize the the neural network
const neuralNetwork = ml5.neuralNetwork(1, 1);

// add in some data
for (let i = 0; i < 100; i += 1) {
  const x = i;
  const y = i * 2;
  neuralNetwork.data.addData([x], [y]);
}

// normalize your data
neuralNetwork.data.normalize();
// train your model
neuralNetwork.train(finishedTraining);

// when it is done training, run .predict()
function finishedTraining() {
  neuralNetwork.predict([50], (err, results) => {
    console.log(results);
  });
}
```


## Usage

### Initialize

```js
// Option 1: specifying the inputs and outputs with the intention of adding data later
const neuralNetwork = ml5.neuralNetwork(3, 2);
// OR Option 2: specifying the inputs and outputs in an options object
const neuralNetwork = ml5.neuralNetwork(inputsOrOptions);
// OR Option 3: specifying the inputs, outputs, and dataUrl, with a callback
const neuralNetwork = ml5.neuralNetwork(inputsOrOptions, outputsOrCallback);

```

#### Parameters
* **inputsOrOptions**: REQUIRED. An `options` object or a number specifying the number of inputs.
* **outputsOrCallback**: OPTIONAL. A callback to be called after your data is loaded as specified in the `options.dataUrl` or a `number` specifying the number of `outputs`.

The options that can be specified are:

```js
const DEFAULTS = {
  dataUrl: 'data.csv', // can be a url path or relative path
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
};
```

* For your reference, a few typical uses are showcased below:
  * Example 1:
    ```js
    const options = {
      inputs: 1,
      outputs: 1,
      type: 'regression',
    };
    const neuralNetwork = ml5.neuralNetwork(options);
    ```
  * Example 2: loading data as a csv
    ```js
    const options = {
      dataUrl: 'weather.csv',
      inputs: ['avg_temperature', 'humidity'],
      outputs: ['rained'],
      type: 'classification',
    };
    const neuralNetwork = ml5.neuralNetwork(options, modelLoaded);
    ```
  * Example 3: loading data as a json
    ```js
    /**
    The weather json looks something like:
    {"data": [
      {"xs": {"avg_temperature":20, "humidity": 0.2}, "ys": {"rained": "no"}},
      {"xs": {"avg_temperature":30, "humidity": 0.9}, "ys": {"rained": "yes"}}
    ] }
    * */
    const options = {
      dataUrl: 'weather.json',
      inputs: ['avg_temperature', 'humidity'],
      outputs: ['rained'],
      type: 'classification',
    };
    const neuralNetwork = ml5.neuralNetwork(options, modelLoaded);
    ```
  * Example 4: specifying labels for a blank neural network
    ```js
    const options = {
      inputs: ['x', 'y'],
      outputs: ['label'],
      type: 'classification',
    };
    const neuralNetwork = ml5.neuralNetwork(options);
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
#### .addData()
> If you are not uploading data using the `dataUrl` property of the options given to the constructor, then you can add data to a "blank" neural network class using the `.addData()` function.

```js
neuralNetwork.addData(xs, ys);
```

📥 **Inputs**

* **xs**: Required. Array | Object.
  * If an array is given, then the inputs must be ordered as specified in the constructor. If no labels are given in the constructor, then the order that your data are added here will set the order of how you will pass data to `.predict()` or `.classify()`.
  * If an object is given, then feed in key/value pairs.
* **ys**: Required. Array | Object.
  * If an array is given, then the inputs must be ordered as specified in the constructor.
  * If an object is given, then feed in key/value pairs.

📤 **Outputs**

* n/a: adds data to `neuralNetwork.data.data.raw`

***

***
#### .normalizeData()
> normalizes the data on a scale from 0 to 1. The data being normalized are part of the `NeuralNetworkData` class which can be accessed in: `neuralNetwork.data.data.raw`

```js
neuralNetwork.normalizeData();
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
neuralNetwork.train(?optionsOrCallback, ?optionsOrWhileTraining, ?callback);
```

📥 **Inputs**
* **optionsOrCallback**: Optional.
  * If an object of options is given, then `optionsOrCallback` will be an object where you can specify the `batchSize` and `epochs`:
    ```js
    {
      batchSize: 24,
      epochs: 32,
    };
    ```
  * If a callback function is given here then this will be a callback that will be called when the training is finished.
    ```js
    function doneTraining() {
      console.log('done!');
    }
    ```
  * If a callback function is given here and a second callback function is given, `optionsOrCallback` will be a callback function that is called after each `epoch` of training, and the `optionsOrWhileTraining` callback function will be a callback function that is called when the training has completed:
    ```js
    function whileTraining(epoch, loss) {
      console.log(`epoch: ${epoch}, loss:${loss}`);
    }
    function doneTraining() {
      console.log('done!');
    }
    neuralNetwork.train(whileTraining, doneTraining);
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
  };
  function whileTraining(epoch, loss) {
    console.log(`epoch: ${epoch}, loss:${loss}`);
  }
  function doneTraining() {
    console.log('done!');
  }
  neuralNetwork.train(trainingOptions, whileTraining, doneTraining);

  ```

📤 **Outputs**

* n/a: Here, `neuralNetwork.model` is created and the model is trained.

***



***
#### .predict()
> Given an input, will return an array of predictions.

```js
neuralNetwork.predict(inputs, callback);
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
neuralNetwork.predictMultiple(inputs, callback);
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
neuralNetwork.classify(inputs, callback);
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
neuralNetwork.classifyMultiple(inputs, callback);
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
> Saves the data that has been added

```js
neuralNetwork.saveData(?outputName, ?callback);
```

📥 **Inputs**
* **outputName**: Optional. String. An output name you'd like your data to be called. If no input is given, then the name will be `data_YYYY-MM-DD_mm-hh`.
* **callback**: Optional. function. A callback that is called after the data has been saved.


📤 **Outputs**

* n/a: downloads the data to a `.json` file in your `downloads` folder.

***

***
#### .loadData()
> loads the data to `neuralNetwork.data.data.raw`

```js
neuralnetwork.loadData(?filesOrPath, ?callback);
```

📥 **Inputs**
* **filesOrPath**: REQUIRED. String | InputFiles. A string path to a `.json` data object or InputFiles from html input `type="file"`. Must be structured for example as: `{"data": [ { xs:{input0:1, input1:2}, ys:{output0:"a"},  ...]}`
* **callback**: Optional. function. A callback that is called after the data has been loaded.

📤 **Outputs**

* n/a: set `neuralNetwork.data.data.raw` to the array specified in the `"data"` property of the incoming `.json` file.

***


***
#### .save()
> Saves the trained model

```js
neuralNetwork.save(?outputName, ?callback);
```

📥 **Inputs**
* **outputName**: Optional. String. An output name you'd like your model to be called. If no input is given, then the name will be `model`.
* **callback**: Optional. function. A callback that is called after the model has been saved.

📤 **Outputs**

* n/a: downloads the model to a `.json` file and a `model.weights.bin` binary file in your `downloads` folder.

***

***
#### .load()
> Loads a pre-trained model

```js
neuralNetwork.load(?filesOrPath, ?callback);
```

📥 **Inputs**
* **filesOrPath**: REQUIRED. String | InputFiles.
  * If a string path to the `model.json` data object is given, then the `model.json`, `model_meta.json` file and its accompanying `model.weights.bin` file will be loaded. Note that the names must match.
  * If InputFiles from html input `type="file"`. Then make sure to select ALL THREE of the `model.json`, `model_meta.json` and the `model.weights.bin` file together to upload otherwise the load will throw an error.
  * Method 1: using a json object. In this case, the paths to the specific files are set directly.
    ```js
    const modelInfo = {
      model: 'path/to/model.json',
      metadata: 'path/to/model_meta.json',
      weights: 'path/to/model.weights.bin',
    };
    neuralNetwork.load(modelInfo, modelLoadedCallback);
    ```
  * Method 2: specifying only the path to th model.json. In this case, the `model_meta.json` and the `model.weights.bin` are assumed to be in the same directory, named exactly like `model_meta.json` and `model.weights.bin`.
    ```js
    neuralNetwork.load('path/to/model.json', modelLoadedCallback);
    ```
  * Method 3: using the `<input type="file" multiple>`
* **callback**: Optional. function. A callback that is called after the model has been loaded.

📤 **Outputs**

* n/a: loads the model to `neuralNetwork.model`


***



## Examples


**p5.js**
- [NeuralNetwork_Simple-Classification](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_Simple-Classification)
- [NeuralNetwork_Simple-Regression](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_Simple-Regression)
- [NeuralNetwork_XOR](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_XOR)
- [NeuralNetwork_basics](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_basics)
- [NeuralNetwork_co2net](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_co2net)
- [NeuralNetwork_color_classifier](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_color_classifier)
- [NeuralNetwork_load_model](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_load_model)
- [NeuralNetwork_load_saved_data](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_load_saved_data)
- [NeuralNetwork_lowres_pixels](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_lowres_pixels)
- [NeuralNetwork_multiple-layers](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_multiple-layer)
- [NeuralNetwork_musical_face](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_musical_face)
- [NeuralNetwork_musical_mouse](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_musical_mouse)
- [NeuralNetwork_pose_classifier](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_pose_classifier)
- [NeuralNetwork_titanic](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_titanic)
- [NeuralNetwork_xy_classifier](https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_xy_classifier)

**p5 web editor**
- [NeuralNetwork_Simple-Classification](https://editor.p5js.org/ml5/sketches/NeuralNetwork_Simple-Classification)
- [NeuralNetwork_Simple-Regression](https://editor.p5js.org/ml5/sketches/NeuralNetwork_Simple-Regression)
- [NeuralNetwork_XOR](https://editor.p5js.org/ml5/sketches/NeuralNetwork_XOR)
- [NeuralNetwork_basics](https://editor.p5js.org/ml5/sketches/NeuralNetwork_basics)
- [NeuralNetwork_co2net](https://editor.p5js.org/ml5/sketches/NeuralNetwork_co2net)
- [NeuralNetwork_color_classifier](https://editor.p5js.org/ml5/sketches/NeuralNetwork_color_classifier)
- [NeuralNetwork_load_model](https://editor.p5js.org/ml5/sketches/NeuralNetwork_load_model)
- [NeuralNetwork_load_saved_data](https://editor.p5js.org/ml5/sketches/NeuralNetwork_load_saved_data)
- [NeuralNetwork_lowres_pixels](https://editor.p5js.org/ml5/sketches/NeuralNetwork_lowres_pixels)
- [NeuralNetwork_multiple-layers](https://https://editor.p5js.org/ml5/sketches/NeuralNetwork_multiple-layer)
- [NeuralNetwork_musical_face](https://editor.p5js.org/ml5/sketches/NeuralNetwork_musical_face)
- [NeuralNetwork_musical_mouse](https://editor.p5js.org/ml5/sketches/NeuralNetwork_musical_mouse)
- [NeuralNetwork_pose_classifier](https://editor.p5js.org/ml5/sketches/NeuralNetwork_pose_classifier)
- [NeuralNetwork_titanic](https://editor.p5js.org/ml5/sketches/NeuralNetwork_titanic)
- [NeuralNetwork_xy_classifier](https://editor.p5js.org/ml5/sketches/NeuralNetwork_xy_classifier)

**plain javascript**

* coming soon

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * [Dan Shiffman](https://github.com/shiffman)
  * [Joey Lee](https://github.com/joeyklee/)
  * [Yining Shi](https://github.com/yining1023/)
  * [Lydia Jessup](https://github.com/lydiajessup)

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/NeuralNetwork](https://github.com/ml5js/ml5-library/tree/development/src/NeuralNetwork)
