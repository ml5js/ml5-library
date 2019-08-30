# ImageClassifier


<center>
    <img style="display:block; max-height:20rem" alt="image classification of bird" src="/../images/reference__header-imageClassifier.png">
</center>


## Description
You can use neural networks to recognize the content of images. ml5.imageClassifier() is a method to create an object that classifies an image using a pre-trained model.

It should be noted that the pre-trained model provided by the example below was trained on a database of approximately 15 million images (ImageNet). The ml5 library accesses this model from the cloud. What the algorithm labels an image is entirely dependent on that training data -- what is included, excluded, and how those images are labeled (or mislabeled).

## Quickstart

```js
// Initialize the Image Classifier method with MobileNet
const classifier = ml5.imageClassifier('MobileNet', modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Make a prediction with a selected image
classifier.classify(document.getElementById('image'), function(err, results) {
  console.log(results);
});
```


## Usage

### Initialize

```js
const classifier = ml5.imageClassifier(model, ?video, ?options, ?callback)
```

#### Parameters
* **model**: REQUIRED. A String value of a valid model OR a url to a model.json that contains a pre-trained model. Case insensitive. Models available are: 'MobileNet', 'Darknet' and 'Darknet-tiny', or any image classifiation model trained in Teachable Machine.
* **video**: OPTIONAL. An HTMLVideoElement
* **callback**: OPTIONAL. A function to run once the model has been loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.
* **options**: OPTIONAL. An object to change the defaults (shown below). The available options are:
    ```
    { 
      version: 1, 
      alpha: 1.0, 
      topk: 3 
    }
    ```

### Properties


***
#### .video
> *Object*. HTMLVideoElement if given in the constructor. Otherwise it is null.
***

***
#### .model
> *Object*. The image classifier model specified in the constructor.
***

***
#### .modelName
> *String*. The name of the image classifier model specified in the constructor
***

***
#### .modelUrl
> *String*. The absolute or relative URL path to the input model.
***


### Methods

***
#### .classify()
> Given an image or video, returns an array of objects containing class names and probabilities

If you DID NOT specify an image or video in the constructor...
```js
classifier.classify(input, ?numberOfClasses,?callback)
```

If you DID specify an image or video in the constructor...
```js
classifier.classify(?numberOfClasses ,?callback)
```

📥 **Inputs**

* **input**: HTMLImageElement | ImageData | HTMLCanvasElement | HTMLVideoElement. NOTE: Videos can also be added in the constructor and then do not need to be specified again as an input.
* **numberOfClasses**: Number. The number of classes you want to return.
* **callback**: Function. A function to handle the results of `.segment()`. Likely a function to do something with the segmented image.

📤 **Outputs**

* **Object**: Returns an array of objects. Each object contains `{label, confidence}`.

***


## Examples

**plain javascript**
* [ImageClassification]()
* [ImageClassification_DoodleNet_Canvas]()
* [ImageClassification_DoodleNet_Video]()
* [ImageClassification_MultipleImages]()
* [ImageClassification_Video]()
* [ImageClassification_Video_Load]()
* [ImageClassification_VideoScavengerHunt]()
* [ImageClassification_VideoSound]()
* [ImageClassification_VideoSoundTranslate]()

**p5.js**
* [ImageClassification]()
* [ImageClassification_DoodleNet_Canvas]()
* [ImageClassification_DoodleNet_Video]()
* [ImageClassification_MultipleImages]()
* [ImageClassification_Video]()
* [ImageClassification_Video_Load]()
* [ImageClassification_VideoScavengerHunt]()
* [ImageClassification_VideoSound]()
* [ImageClassification_VideoSoundTranslate]()

## Demo

No demos yet - contribute one today!

## Tutorials

### Webcam Image Classification via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/D9BoBSkLvFo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Image Classification with MobileNet via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/yNkAuWz5lnY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Acknowledgements

**Contributors**:
  * Name 1
  * Name 2

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/ImageClassifier]()
