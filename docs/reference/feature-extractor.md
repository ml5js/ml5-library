# FeatureExtractor


<center>
    <img style="display:block; max-height:20rem" alt="Illustration of a brain being sent through a funnel" src="_media/reference__header-feature-extractor.png">
</center>


## Description

You can use neural networks to recognize the content of images. Most of the time you will be using a "pre-trained" model trained on a large dataset to classify an image into a fixed set of categories. However you can also use a part of the pre-trained model: the [features](https://en.wikipedia.org/wiki/Feature_extraction). Those features allow you to 'retrain' or 'reuse' the model for a new custom task. This is known as [Transfer Learning](https://en.wikipedia.org/wiki/Transfer_learning).

This class allows you to extract features of an image via a pre-trained model and re-train that model with new data.

## Quickstart

```js
// Extract the already learned features from MobileNet
const featureExtractor = ml5.featureExtractor('MobileNet', modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Create a new classifier using those features and with a video element
const classifier = featureExtractor.classification(video, videoReady);

// Triggers when the video is ready
function videoReady() {
  console.log('The video is ready!');
}

// Add a new image with a label
classifier.addImage(document.getElementById('dogA'), 'dog');

// Retrain the network
classifier.train((lossValue) => {
  console.log('Loss is', lossValue);
});

// Get a prediction for that image
classifier.classify(document.getElementById('dogB'), (err, result) => {
  console.log(result); // Should output 'dog'
});
```


## Usage

### Initialize

```js
// initial without options
const featureExtractor = ml5.featureExtractor(model, ?callback);
// OR with options included
const featureExtractor = ml5.featureExtractor(model, ?options, ?callback);
```

#### Parameters
* **model**: REQUIRED. The model from which extract the learned features. Case-insensitive
* **callback**: OPTIONAL. A function to be executed once the model has been loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.
* **options**: OPTIONAL. An object containing custom options. For the MobileNet model these are the custom options you can reset.

  ```js
  {
    version: 1,
    alpha: 1.0,
    topk: 3,
    learningRate: 0.0001,
    hiddenUnits: 100,
    epochs: 20,
    numLabels: 2,
    batchSize: 0.4,
  };
  ```

### Properties

***
#### .modelLoaded
> Boolean value that specifies if the model has loaded.
***

***
#### .hasAnyTrainedClass
> Boolean value that specifies if new data has been added to the model
***

***
#### .usageType
> String that specifies how is the Extractor being used. Possible values are 'regressor' and 'classifier'
***

***
#### .isPredicting
> Boolean value to check if the model is predicting.
***



### Methods


***
#### .classification(**?video**, **?callback**)
> Use the features of MobileNet as a classifier

```js
featureExtractor.classification(?video, ?callback);
```

📥 **Inputs**

* **video**:  Optional. An HTML video element or a p5.js video element.
* **callback**: Optional. A function to be called once the video is ready. If no callback is provided, it will return a promise that will be resolved once the video element has loaded.

📤 **Outputs**

* n/a

***

***
#### .regression()
> Use the features of MobileNet as a regressor

```js
featureExtractor.regression(?video, ?callback);
```

📥 **Inputs**
* **video**: Optional. An HTML video element or a p5.js video element.
* **callback**: Optional. A function to be called once the video is ready. If no callback is provided, it will return a promise that will be resolved once the video element has loaded.

📤 **Outputs**

* n/a

***

***
#### .addImage()
> Adds a new image element to the featureExtractor for training

```js
featureExtractor.addImage(label, ?callback);
// OR
featureExtractor.addImage(input, label, ?callback);
```

📥 **Inputs**
* **input** - Optional. An HTML image or video element or a p5 image or video element. If not input is provided, the video element provided in the method-type will be used.
* **label** - The label to associate the new image with. When using the classifier this can be strings or numbers. For a regressor, this needs to be a number.
* **callback** - Optional. A function to be called once the new image has been added to the model. If no callback is provided, it will return a promise that will be resolved once the image has been added.

📤 **Outputs**

* n/a

***

***
#### .train()
> Retrain the model with the provided images and labels using the models original features as starting point.

```js
featureExtractor.train(?callback);
```

📥 **Inputs**
* **callback** - Optional. A function to be called to follow the progress of the training.

📤 **Outputs**

* n/a

***

***
#### .classify()
> Classifies an an image based on a new retrained model. `.classification()` needs to be used with this.

```js
featureExtractor.classify(?callback);
// OR
featureExtractor.classify(input, ?callback);
```

📥 **Inputs**
* **input** - Optional. An HTML image or video element or a p5 image or video element. If not input is provided, the video element provided in the method-type will be used.
* **callback** - Optional. A function to be called once the input has been classified. If no callback is provided, it will return a promise that will be resolved once the model has classified the image.

📤 **Outputs**
* **Object** - returns the {label, confidence}

***



***
#### .predict()
> Predicts a continuous value based on a new retrained model. `.regression()` needs to be used with this.

```js
featureExtractor.predict(?callback);
// OR
featureExtractor.predict(input, ?callback);
```

📥 **Inputs**
* **input** - Optional. An HTML image or video element or a p5 image or video element. If not input is provided, the video element provided when creating the regression will be used.
* **callback** - Optional. A function to be called once the input has been predicted. If no callback is provided, it will return a promise that will be resolved once the model has predicted the image.

📤 **Outputs**
* **Object** - an object with  {value}.

***

***
#### .save()
> Saves your model to the downloads folder of your machine.

```js
featureExtractor.save(?callback, ?name);
```

📥 **Inputs**
* **callback** - Optional. A function to be called once the input has been predicted. If no callback is provided, it will return a promise that will be resolved once the model has predicted the image.
* **name** - Optional. A name that you'd like to give to your saved model. This should be a text string. The default is 

📤 **Outputs**
* Downloads a `model.json` and `model.weights.bin` file to your downloads directory.

***

***
#### .load()
> Allows you to load your model from a URL path or via an HTML input file reader.

```js
featureExtractor.load(filesOrPath = null, callback);
```

📥 **Inputs**
* **filesOrPath** - A path to your `model.json` if you are using a string path. If you are using the HTML file input, then select BOTH the `model.json` and the `model.weights.bin` files.
* **callback** - Optional. A function to do after your model has been loaded

📤 **Outputs**
* Returns the loaded model.

***



## Examples

**p5.js**
* [FeatureExtractor_Image_Regression](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/FeatureExtractor/FeatureExtractor_Image_Regression)
* [FeatureExtractor_Image_Classification](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/FeatureExtractor/FeatureExtractor_Image_Classification)

**p5 web editor**
* [FeatureExtractor_Image_Regression](https://editor.p5js.org/ml5/sketches/FeatureExtractor_Image_Regression)
* [FeatureExtractor_Image_Classification](https://editor.p5js.org/ml5/sketches/FeatureExtractor_Image_Classification)


**plain javascript**
* [FeatureExtractor_Image_Regression](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/FeatureExtractor/FeatureExtractor_Image_Regression)
* [FeatureExtractor_Image_Classification](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/FeatureExtractor/FeatureExtractor_Image_Classification)



## Demo

No demos yet - contribute one today!

## Tutorials

### ml5.js Feature Extractor Classification via CodingTrain
<iframe width="560" height="315" src="https://www.youtube.com/embed/eeO-rWYFuG0"  frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### ml5.js Transfer Learning with Feature Extractor via CodingTrain
<iframe width="560" height="315" src="https://www.youtube.com/embed/kRpZ5OqUY6Y"  frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### ml5.js Feature Extractor Regression via CodingTrain
<iframe width="560" height="315" src="https://www.youtube.com/embed/aKgq0m1YjvQ"  frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Acknowledgements

**Contributors**:
  * Yining Shi & Cristobal Valenzuela

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

[src/FeatureExtractor](https://github.com/ml5js/ml5-library/tree/main/src/FeatureExtractor)
