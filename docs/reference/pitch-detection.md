# PitchDetection


<center>
    <img style="display:block; max-height:20rem" alt="illustration of sound waves" src="_media/reference__header-pitch-detection.png">
</center>


## Description

A pitch detection algorithm is a way of estimating the pitch or fundamental frequency of an audio signal. This method allows to use a pre-trained machine learning pitch detection model to estimate the pitch of sound file.

At present ml5.js only supports the CREPE model. This model is a direct port of [github.com/marl/crepe](https://github.com/marl/crepe) and only works with direct input from the browser microphone.

## Quickstart

```js
const audioContext = new AudioContext();
// const MicStream = MicStream
const pitch = ml5.pitchDetection(
  './model/',
  audioContext,
  MicStream,
  modelLoaded,
);

// When the model is loaded
function modelLoaded() {
  console.log('Model Loaded!');
}

pitch.getPitch((err, frequency) => {
  console.log(frequency);
});
```


## Usage

### Initialize

```js
const detector = ml5.pitchDetection(model, audioContext, stream, callback);
```

#### Parameters
* **model**: REQUIRED. The path to the trained model. Only [CREPE](https://github.com/marl/crepe) is available for now. Case insensitive.
* **audioContext**: REQUIRED. The browser audioContext to use.
* **stream MediaStream**: REQUIRED. The media stream to use.
* **callback**: Optional. A callback to be called once the model has loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.

### Properties


***
#### .audioContext
> the AudioContext instance. Contains sampleRate, currentTime, state, baseLatency.
***

***
#### .model
>  the pitch detection model.
***

***
#### .results
> the current pitch prediction results from the classification model.
***

***
#### .running
> a boolean value stating whether the model instance is running or not.
***

***
#### .stream
> the MediaStream instance. Contains an id and a boolean `active` value.
***



### Methods


***
#### .getPitch()
> gets the pitch.

```js
detector.getPitch(?callback);
```

📥 **Inputs**

* **callback**: Optional. A function to be called when the model has generated content. If no callback is provided, it will return a promise that will be resolved once the model has predicted the pitch.

📤 **Outputs**

* **Object**: Returns the pitch from the model attempting to predict the pitch.

***


## Examples

**p5.js**
* [PitchDetection](https://github.com/ml5js/ml5-examples/tree/development/p5js/PitchDetection/PitchDetection)
* [PitchDetection_Game](https://github.com/ml5js/ml5-examples/tree/development/p5js/PitchDetection/PitchDetection_Game)
* [PitchDetection_Piano](https://github.com/ml5js/ml5-examples/tree/development/p5js/PitchDetection/PitchDetection_Piano)

**p5 web editor**
* [PitchDetection](https://editor.p5js.org/ml5/sketches/PitchDetection)
* [PitchDetection_Game](https://editor.p5js.org/ml5/sketches/PitchDetection_Game)
* [PitchDetection_Piano](https://editor.p5js.org/ml5/sketches/PitchDetection_Piano)

**plain javascript**
* [PitchDetection](https://github.com/ml5js/ml5-examples/tree/development/javascript/PitchDetection/PitchDetection)
* [PitchDetection_Game](https://github.com/ml5js/ml5-examples/tree/development/javascript/PitchDetection/PitchDetection_Game)
* [PitchDetection_Piano](https://github.com/ml5js/ml5-examples/tree/development/javascript/PitchDetection/PitchDetection_Piano)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * Hannah Davis

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

[/src/PitchDetection](https://github.com/ml5js/ml5-library/tree/development/src/PitchDetection)
