# ImageClassifier


<center>
    <img style="display:block; max-height:20rem" alt="image classification of bird" src="_media/reference__header-imageClassifier.png">
</center>


## Description
You can use neural networks to recognize the content of images. `ml5.imageClassifier()` is a method to create an object that classifies an image using a pre-trained model.

It should be noted that the pre-trained model provided by the example below was trained on a database of approximately 15 million images (ImageNet). The ml5 library accesses this model from the cloud. What the algorithm labels an image is entirely dependent on that training data -- what is included, excluded, and how those images are labeled (or mislabeled).

**Train your own image classification model with Teachable Machine**: If you'd like to train your own custom image classification model, try [Google's Teachable Machine](https://teachablemachine.withgoogle.com/io19).

## Quickstart

```js
// Initialize the Image Classifier method with MobileNet
const classifier = ml5.imageClassifier('MobileNet', modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

// Make a prediction with a selected image
classifier.classify(document.getElementById('image'), (err, results) => {
  console.log(results);
});
```


## Usage

### Initialize

```js
const classifier = ml5.imageClassifier(model, ?video, ?options, ?callback);
```

#### Parameters
* **model**: REQUIRED. A String value of a valid model OR a url to a model.json that contains a pre-trained model. Case insensitive. Models available are: 'MobileNet', 'Darknet' and 'Darknet-tiny','DoodleNet', or any image classification model trained in Teachable Machine. Below are some examples of creating a new image classifier:
  * `mobilenet`:
    ```js
    const classifier = ml5.imageClassifier('MobileNet', modelReady);
    ```
  * `Darknet`:
    ```js
    const classifier = ml5.imageClassifier('Darknet', modelReady);
    ```
  * `DoodleNet`:
    ```js
    const classifier = ml5.imageClassifier('DoodleNet', modelReady);
    ```
  * Custom Model from Teachable Machine:
    ```js
    const classifier = ml5.imageClassifier('path/to/custom/model.json', modelReady);
    ```
* **video**: OPTIONAL. An HTMLVideoElement
* **callback**: OPTIONAL. A function to run once the model has been loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.
* **options**: OPTIONAL. An object to change the defaults (shown below). The available options are:
  ```js
  {
    version: 1,
    alpha: 1.0,
    topk: 3,
  };
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
classifier.classify(input, ?numberOfClasses, ?callback);
```

If you DID specify an image or video in the constructor...
```js
classifier.classify(?numberOfClasses , ?callback);
```

📥 **Inputs**

* **input**: HTMLImageElement | ImageData | HTMLCanvasElement | HTMLVideoElement. NOTE: Videos can also be added in the constructor and then do not need to be specified again as an input.
* **numberOfClasses**: Number. The number of classes you want to return.
* **callback**: Function. A function to handle the results of `.segment()`. Likely a function to do something with the segmented image.

📤 **Outputs**

* **Object**: Returns an array of objects. Each object contains `{label, confidence}`.

***


## Examples

**p5.js**
* [ImageClassification](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification)
* [ImageClassification_DoodleNet_Canvas](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_DoodleNet_Canvas)
* [ImageClassification_DoodleNet_Video](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_DoodleNet_Video)
* [ImageClassification_MultipleImages](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_MultipleImages)
* [ImageClassification_Teachable-Machine](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_Teachable-Machine)
* [ImageClassification_Video](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_Video)
* [ImageClassification_VideoScavengerHunt](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_VideoScavengerHunt)
* [ImageClassification_VideoSound](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_VideoSound)
* [ImageClassification_VideoSoundTranslate](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_VideoSoundTranslate)
* [ImageClassification_Video_Load](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ImageClassification/ImageClassification_Video_Load)

**p5.js Web Editor**

* [ImageClassification](https://editor.p5js.org/ml5/sketches/ImageClassification)
* [ImageClassification_DoodleNet_Canvas](https://editor.p5js.org/ml5/sketches/ImageClassification_DoodleNet_Canvas)
* [ImageClassification_DoodleNet_Video](https://editor.p5js.org/ml5/sketches/ImageClassification_DoodleNet_Video)
* [ImageClassification_MultipleImages](https://editor.p5js.org/ml5/sketches/ImageClassification_MultipleImages)
* [ImageClassification_Teachable-Machine](https://editor.p5js.org/ml5/sketches/ImageClassification_Teachable-Machine)
* [ImageClassification_Video](https://editor.p5js.org/ml5/sketches/ImageClassification_Video)
* [ImageClassification_VideoScavengerHunt](https://editor.p5js.org/ml5/sketches/ImageClassification_VideoScavengerHunt)
* [ImageClassification_VideoSound](https://editor.p5js.org/ml5/sketches/ImageClassification_VideoSound)
* [ImageClassification_VideoSoundTranslate](https://editor.p5js.org/ml5/sketches/ImageClassification_VideoSoundTranslate)

**plain javascript**
* [ImageClassification](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification)
* [ImageClassification_DoodleNet_Canvas](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_DoodleNet_Canvas)
* [ImageClassification_DoodleNet_Video](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_DoodleNet_Video)
* [ImageClassification_MultipleImages](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_MultipleImages)
* [ImageClassification_Video](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_Video)
* [ImageClassification_VideoScavengerHunt](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_VideoScavengerHunt)
* [ImageClassification_VideoSound](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_VideoSound)
* [ImageClassification_VideoSoundTranslate](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_VideoSoundTranslate)
* [ImageClassification_Video_Load](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ImageClassification/ImageClassification_Video_Load)

## Demo

No demos yet - contribute one today!

## Tutorials

### Webcam Image Classification via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/D9BoBSkLvFo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Image Classification with MobileNet via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/yNkAuWz5lnY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

A nice description of the models overview

#### MobileNet - Model Biography

- **Description**
  - MobileNet is a term that describes a type of machine learning model architecture that has been optimized to run on platforms with limited computational power, such as applications on mobile or embedded devices. MobileNets have several use cases including image classification, object detection, and image segmentation. This particular MobileNet model was trained for Image Classification.
  - ml5 uses a MobileNet created with TensorFlow.js, a JavaScript library from TensorFlow. Several TensorFlow.js MobileNet versions are available for image classification, and as of June 2019, ml5 defaults to importing MobileNetV2.
- **Developer and Year**
  - Google’s Tensorflow.js team
- **Purpose and Intended Users**
  - From the website: TensorFlow is an open source machine learning platform that “has a comprehensive, flexible ecosystem of tools, libraries, and community resources that lets researchers push the state-of-the-art in ML and developers easily build and deploy ML-powered applications.” This model is available for use in the ml5 library because Tensorflow licenses it with Apache License 2.0.
- **Hosted Location**
  - ml5 imports MobileNetV2 from TensorFlow, hosted on the NPM database, however a different version may be specified in your ml5 script. For whichever you specify, your ml5 sketch will automatically use the most recent version distributed on NPM.
- **ml5 Contributor and Year**
  - Ported by Cristóbal Valenzuela & Dan Shiffman in 2018 
- **References**
  - ml5 Contributor [Cristóbal Valenzuela](https://cvalenzuelab.com/)
  - Website [TensorFlow](https://www.tensorflow.org/)
  - GitHub Repository [TensorFlow.js MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet)
  - NPM Readme [@tensorflow-models/mobilenet](https://www.npmjs.com/package/@tensorflow-models/mobilenet)
  - Paper [MobileNetV2: MobileNetV2: Inverted Residuals and Linear Bottlenecks](https://arxiv.org/abs/1801.04381)

#### MobileNet - Data Biography

- **Description**
  - The TensorFlow MobileNetV2 model on which the TensorFlow.js version is based was trained on 50K photographs. In addition, 150K photographs are also provided by the source for validation and testing.
- **Source**
  - The images are from the ImageNet database from ImageNet’s Large Scale Visual Recognition Challenge 2012 (ILSVRC2012).
- **Collector and Year**
  - Development of the ImageNet dataset began in 2009 and is currently maintained by researchers at U.S. universities.
- **Collection Method**
  - From the website:  photographs for the validation and test data were collected from “flickr and other search engines, hand labeled with the presence or absence of 1000 object categories.”
- **Purpose and Intended Users**
  - From the website: ImageNet datasets are publicly available and frequently used in computer vision research. The research team “envision[s] ImageNet as a useful resource to researchers in the academic world, as well as educators around the world.” According to an update posted in September 2019, it contains over 14 million images and 22,000 visual categories using a vocabulary from the English dataset, WordNet.
- **References**
  - Website [ImageNet](http://www.image-net.org/)
  - Website [ImageNet’s Large Scale Visual Recognition Challenge 2012 (ILSVRC2012)](http://www.image-net.org/challenges/LSVRC/2012/)

#### DarkNet and DarkNet-tiny - Model Biography

- **Description**
  - DarkNet (or DarkNet Reference) and Darknet-tiny (or Tiny Darknet are small and fast pre-trained models. Tiny Darknet is the smaller model of the two, but Darknet Reference is faster. The developer provides an open source framework, also called Darknet, for running models.
- **Developer and Year**
  - Joseph Redmon
- **Purpose and Intended Users**
  - Redmon provides several open source licenses, including MIT License.
- **Hosted Location**
  - ml5 hosts both models
- **ml5 Contributor and Year**
  - Ported by Mohamed Amine in 2018
- **References**
  - Developer [Joseph Redmon](https://pjreddie.com/)
  - ml5 Contributor [Mohamed Amine](https://github.com/TheHidden1)
  - Website Darknet/[Darknet Reference](https://pjreddie.com/darknet/imagenet/#reference)
  - Website Darknet-tiny/ [Tiny DarkNet](https://pjreddie.com/darknet/tiny-darknet/)

#### DarkNet and DarkNet-tiny - Data Biography

- **Description**
  - Darknet Reference is listed as a pre-trained model for ImageNet classification, so it is likely that the data are photographs from the ImageNet database.
- **Source**
  - You can learn more about the ImageNet in the MobileNet section above.
- **Collector and Year**
  - TBD
- **Collection Method**
  - TBD
- **Purpose and Intended Users**
  - TBD
- **References**
  - TBD

#### DoodleNet - Model Biography

- **Description**
  - This pre-trained model classifies and labels hand-drawn sketches from 345 categories. 
- **Developer and Year**
  - Yining Shi developed the model in TensorFlow and ported it to TensorFlow.js so that it could be ported to the ml5 library.
- **Purpose and Intended Users**
  - Developed for the ml5 community
- **Hosted Location**
  - ml5 hosts this model
- **ml5 Contributor and Year**
  - Yining Shi in 2019
- **References**
  - Developer and ml5 Contributor [Yining Shi](https://1023.io/)
  - GitHub Repository [DoodleNet](https://github.com/yining1023/doodleNet)

#### DoodleNet - Data Biography

- **Description**
  - The training dataset consists of 345 categories of doodles with 50K images per category. 
- **Source**
  - Google’s Quick, Draw! Dataset
- **Collector and Year**
  - Google released the Quick, Draw! game in 2016. Shi collected images for her model in 2019.
- **Collection Method**
  - The doodles are crowdsourced from visitors’ contributions as they play Google’s Quick, Draw! Game, and they are publicly available to download.
- **Purpose and Intended Users**
  - From the website: Google’s Quick, Draw! Game was developed as “an example of how you can use machine learning in fun ways” by the Google Creative Lab, Data Arts Team, and their collaborators as part of Google’s AI Experiments showcase. 
- **References**
  - Website [Google’s Quick, Draw!](https://quickdraw.withgoogle.com/#)
  - Website [Google’s Quick, Draw! Dataset](https://quickdraw.withgoogle.com/data)




## Acknowledgements

**Contributors**:
  * [Cristobal Valenzuela](https://cvalenzuelab.com/)
  * [Yining Shi](https://1023.io)

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/ImageClassifier](https://github.com/ml5js/ml5-library/tree/main/src/ImageClassifier)
