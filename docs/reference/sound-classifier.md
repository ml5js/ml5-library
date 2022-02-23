# SoundClassifier


<center>
    <img style="display:block; max-height:20rem" alt="placeholder" src="_media/reference__header-sound-classifier.png">
</center>


## Description

The ml5.soundClassifier() allows you to classify audio. With the right pre-trained models, you can detect whether a certain noise was made (e.g. a clapping sound or a whistle) or a certain word was said (e.g. Up, Down, Yes, No). At this moment, with the ml5.soundClassifier(), you can use your own custom pre-trained speech commands or use the the "SpeechCommands18w" which can recognize "the ten digits from "zero" to "nine", "up", "down", "left", "right", "go", "stop", "yes", "no", as well as the additional categories of "unknown word" and "background noise"."

**Train your own sound classifier model with Teachable Machine**: If you'd like to train your own custom sound classification model, try [Google's Teachable Machine](https://teachablemachine.withgoogle.com).

## Quickstart

```js
// Options for the SpeechCommands18w model, the default probabilityThreshold is 0
const options = { probabilityThreshold: 0.7 };
const classifier = ml5.soundClassifier('SpeechCommands18w', options, modelReady);

function modelReady() {
  // classify sound
  classifier.classify(gotResult);
}

function gotResult(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  // log the result
  console.log(result);
}
```


## Usage

### Initialize

```js
const soundclassifier = ml5.soundClassifier(?model, ?options, ?callback)
```

By default the soundClassifier will start the default microphone.

#### Parameters
* **model**: Optional. Model name or URL path to a `model.json`. Here are some options:
  * `SpeechCommands18w`: loads the 18w speech commands
    ```js
    const classifier = ml5.soundClassifier('SpeechCommands18w', modelReady);
    ```
  * Custom model made in Google's Teachable Machine:
    ```js
    const classifier = ml5.soundClassifier('path/to/model.json', modelReady);
    ```
* **callback**: Optional. A function to run once the model has been loaded.
* **options**: Optional. An object describing a model accuracy and performance. The available parameters are:

  ```js
  {
    probabilityThreshold: 0.7, // probabilityThreshold is 0
  };
  ```

### Properties


***
#### .model
> *Object*. The model.
***


### Methods


***
#### .classify()
> Given a number, will make magicSparkles

```js
soundclassifier.classify(callback);
```

📥 **Inputs**
* **callback**: A function to handle the results of the classification

📤 **Outputs**
* **Array**: Returns an array with "label" and "confidence".

***


## Examples

**p5.js**
* [SoundClassification_speechcommand](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/SoundClassification/SoundClassification_speechcommand)
* [SoundClassification_speechcommand_load](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/SoundClassification/SoundClassification_speechcommand_load)

**p5 web editor**
* [SoundClassification_speechcommand](https://editor.p5js.org/ml5/sketches/SoundClassification_speechcommand)
* [SoundClassification_speechcommand_load](https://editor.p5js.org/ml5/sketches/SoundClassification_speechcommand_load)

**plain javascript**
* [SoundClassification_speechcommand](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/SoundClassification/SoundClassification_speechcommand)
* [SoundClassification_speechcommand_load](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/SoundClassification/SoundClassification_speechcommand_load)



## Demo

No demos yet - contribute one today!

## Tutorials

### ml5.js: Sound Classification via CodingTrain
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/cO4UP2dX944" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

This method allows you to use a provided pre-trained model or import a model that you trained using Google’s Teachable Machine. The provided pre-trained model is called the Speech Command Recognizer.

#### Speech Command Recognizer - Model Biography

- **Description**
  - Speech Command Recognizer defaults to using SpeechCommands18w and supports recognition of twenty vocabulary words.
- **Developer and Year**
  - This model was developed by Google’s Tensorflow.js team in 2018. TensorFlow.js, a JavaScript library from TensorFlow, an open source machine learning platform developed by Google.
- **Purpose and Intended Users**
  - From the website: TensorFlow is an open source machine learning platform that “has a comprehensive, flexible ecosystem of tools, libraries, and community resources that lets researchers push the state-of-the-art in ML and developers easily build and deploy ML-powered applications.” This model is available for use in the ml5 library because Tensorflow licenses it with Apache License 2.0.
- **Hosted Location**
  - As of June 2019, ml5 imports Speech Command Recognizer from TensorFlow’s models on the NPM database. This means that your ml5 sketch will automatically use the most recent version distributed on NPM.
- **ml5 Contributor and Year**
  - Ported by Yining Shi in 2019
- **References**
  - Website [TensorFlow](https://www.tensorflow.org/)
  - ml5 Contributor [Yining Shi](https://1023.io/)
  - NPM Readme [@tensorflow-models/speech-commands](https://www.npmjs.com/package/@tensorflow-models/speech-commands)
  - GitHub Repository [Tensorflow.js Speech Commands](https://github.com/tensorflow/tfjs-models/tree/master/speech-commands)

#### Speech Command Recognizer - Data Biography

- **Description**
  - The model was trained on the TensorFlow Speech Commands Dataset, and the data consists of recordings of people saying 30 different words in English, for a total of over 105,000 WAVE audio files. 
- **Source**
  - Open Speech Recording dataset
- **Collector and Year**
  - The recordings were collected by Google’s AIY Team (Do-it-yourself artificial intelligence) under a CC BY license (Commons BY 4.0 license) and as of this writing is an active project.
- **Collection Method**
  - The recordings are crowdsourced from contributors to the Open Speech Recording project. The paper also describes why English was selected as the language of collection, why specific words were chosen, how the collection process is managed, and how the audio files are processed and evaluated. You can read more about the dataset collection process or contribute yourself at the Open Speech Recording website.
- **Purpose and Intended Users**
  - Since very few exist, one goal is to create an open source dataset of speech data so more people can have access to train their own speech recognition models. The paper published about this dataset states that the “primary goal is to provide a way to build and test small models that detect when a single word is spoken, from a set of ten or fewer target words, with as few false positives as possible from background noise or unrelated speech.” 
- **References**
  - Website [TensorFlow Speech Commands Dataset](https://www.tensorflow.org/tutorials/sequences/audio_recognition)
  - Paper [Speech Commands: A Dataset for Limited-Vocabulary Speech Recognition](https://arxiv.org/abs/1804.03209)
  - Website [Google's AIY Team](https://aiyprojects.withgoogle.com/)
  - Website [Open Speech Recording](https://aiyprojects.withgoogle.com/open_speech_recording)




## Acknowledgements

**Contributors**:
  * Yining Shi

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc




## Source Code

* [/src/SoundClassifier/](https://github.com/ml5js/ml5-library/tree/main/src/SoundClassifier)
