# KNNClassifier: K-Nearest Neighbors Classifier


<center>
    <img style="display:block; max-height:20rem" alt="Illustration of hands making the signs of rock, paper, and scissors on top of different labels" src="_media/reference__header-knn-classifier.png">
</center>


## Description

*\"In pattern recognition, the k-nearest neighbors algorithm (k-NN) is a non-parametric method used for classification and regression.[1] In both cases, the input consists of the k closest training examples in the feature space."* - [Wikipedia](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm)

This class allows you to create a classifier using the [K-Nearest Neighbors](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) algorithm. It's a little different from other classes in this library, because it doesn't provide a model with weights, but rather a utility for constructing a KNN model using outputs from another model or any other data that could be classified.

For example, you could get features of an image by calling `FeatureExtractor.infer()`, and feed the features to KNNClassifier to classify an image.

You can also collect any kind of data, construct them into an array of numbers and feed them to KNNClassifier. Check out this [example](/docs/knnclassifier-posenet) that uses KNNClassifier to classify data from [PoseNet](/docs/PoseNet) model.

## Quickstart

```js
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();

// Create a featureExtractor that can extract features of an image
const featureExtractor = ml5.featureExtractor('MobileNet', modelReady);

// Get the features of an image
const features = featureExtractor.infer(myImg);

// Add an example with a label to the KNN Classifier
knnClassifier.addExample(features, label);

// Use KNN Classifier to classify these features
knnClassifier.classify(features, (err, result) => {
  console.log(result); // result.label is the predicted label
});
```


## Usage

### Initialize

```js
const knnClassifier = ml5.KNNClassifier();
```

#### Parameters
* no inputs needed

### Properties



### Methods


***
#### .addExample()
> Adding an example to a class.

```js
knnClassifier.addExample(example, indexOrLabel);
```

📥 **Inputs**

* **example**: Required. An example to add to the dataset, usually an activation from another model
* **indexOrLabel**: Required. String | Number. The class index(number) or label(string) of the example.

📤 **Outputs**

* n/a

***



***
#### .classify()
> Classify an new input.

```js
knnClassifier.classify(input, ?callback);
// OR
knnClassifier.classify(input, ?k, ?callback);
```

📥 **Inputs**
* **input**: REQUIRED. An example to make a prediction on, could be an activation from another model or an array of numbers.
* **k**: Optional. Number. The K value to use in K-nearest neighbors. The algorithm will first find the K nearest examples from those it was previously shown, and then choose the class that appears the most as the final prediction for the input example. Defaults to 3. If examples < k, k = examples.
* **callback**: Optional. Function. A function to be called once the input has been classified. If no callback is provided, it will return a promise that will be resolved once the model has classified the new input.

📤 **Outputs**

* **Object**: It returns an object with a top classIndex and label, confidences mapping all class indices to their confidence, and confidencesByLabel mapping all classes' confidence by label.

***


***
#### .clearLabel()
> Clears the specified label.

```js
knnClassifier.clearLabel(indexOrLabel);
```

📥 **Inputs**
* **input**: REQUIRED. The class index or label, a number or a string.

📤 **Outputs**

* n/a

***

***
#### .clearAllLabels()
> Clear all examples in all labels

```js
knnClassifier.clearAllLabels();
```

📥 **Inputs**
* n/a

📤 **Outputs**

* n/a

***


***
#### .getCountByLabel()
> Get the example count for each label. It returns an object that maps class label to example count for each class.

```js
knnClassifier.getCountByLabel();
```

📥 **Inputs**
* n/a

📤 **Outputs**

* n/a

***


***
#### .getCount()
> Get the example count for each class. It returns an object that maps class index to example count for each class.

```js
knnClassifier.getCount();
```

📥 **Inputs**
* n/a

📤 **Outputs**

* n/a

***

***
#### .getNumLabels()
> It returns the total number of labels.

```js
knnClassifier.getNumLabels();
```

📥 **Inputs**
* n/a

📤 **Outputs**

* n/a

***


***
#### .save()
> Download the whole dataset as a JSON file. It's useful for saving state.

```js
knnClassifier.save(?fileName);
```

📥 **Inputs**
* **fileName**: Optional. The name of the JSON file that will be downloaded. e.g. "myKNN" or "myKNN.json". If no fileName is provided, the default file name is "myKNN.json".

📤 **Outputs**

* Saved file

***

***
#### .load()
> Load a dataset from a JSON file. It's useful for restoring state.

```js
knnClassifier.load(path, ?callback);
```

📥 **Inputs**
* **path**: The path for a valid JSON file.
* **callback**: Optional. A function to run once the dataset has been loaded. If no callback is provided, it will return a promise that will be resolved once the dataset has loaded.

📤 **Outputs**

* n/a

***



## Examples

**p5.js**
* [KNNClassification_PoseNet](https://github.com/ml5js/ml5-examples/tree/development/p5js/KNNClassification/KNNClassification_PoseNet)
* [KNNClassification_Video](https://github.com/ml5js/ml5-examples/tree/development/p5js/KNNClassification/KNNClassification_Video)
* [KNNClassification_VideoSound](https://github.com/ml5js/ml5-examples/tree/development/p5js/KNNClassification/KNNClassification_VideoSound)
* [KNNClassification_VideoSquare](https://github.com/ml5js/ml5-examples/tree/development/p5js/KNNClassification/KNNClassification_VideoSquare)

**p5 web editor**
* [KNNClassification_PoseNet](https://editor.p5js.org/ml5/sketches/KNNClassification_PoseNet)
* [KNNClassification_Video](https://editor.p5js.org/ml5/sketches/KNNClassification_Video)
* [KNNClassification_VideoSound](https://editor.p5js.org/ml5/sketches/It5-KNNClassification_VideoSound)
* [KNNClassification_VideoSquare](https://editor.p5js.org/ml5/sketches/KNNClassification_VideoSquare)


**plain javascript**
* [KNNClassification_PoseNet](https://github.com/ml5js/ml5-examples/tree/development/javascript/KNNClassification/KNNClassification_PoseNet)
* [KNNClassification_Video](https://github.com/ml5js/ml5-examples/tree/development/javascript/KNNClassification/KNNClassification_Video)
* [KNNClassification_VideoSound](https://github.com/ml5js/ml5-examples/tree/development/javascript/KNNClassification/KNNClassification_VideoSound)
* [KNNClassification_VideoSquare](https://github.com/ml5js/ml5-examples/tree/development/javascript/KNNClassification/KNNClassification_VideoSquare)



## Demo

No demos yet - contribute one today!

## Tutorials

### KNN Classification Part 1 via CodingTrain
<iframe width="560" height="315" src="https://www.youtube.com/embed/KTNqXwkLuM4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### KNN Classification Part 2 via CodingTrain
<iframe width="560" height="315" src="https://www.youtube.com/embed/Mwo5_bUVhlA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### KNN Classification Part 3 via CodingTrain
<iframe width="560" height="315" src="https://www.youtube.com/embed/JWsKay58Z2g" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Acknowledgements

**Contributors**:
  * Yining Shi & Cristobal Valenzuela

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

[/src/KNNClassifier/](https://github.com/ml5js/ml5-library/tree/development/src/KNNClassifier)
