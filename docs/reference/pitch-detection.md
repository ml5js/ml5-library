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
* [PitchDetection](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/PitchDetection/PitchDetection)
* [PitchDetection_Game](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/PitchDetection/PitchDetection_Game)
* [PitchDetection_Piano](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/PitchDetection/PitchDetection_Piano)

**p5 web editor**
* [PitchDetection](https://editor.p5js.org/ml5/sketches/PitchDetection)
* [PitchDetection_Game](https://editor.p5js.org/ml5/sketches/PitchDetection_Game)
* [PitchDetection_Piano](https://editor.p5js.org/ml5/sketches/PitchDetection_Piano)

**plain javascript**
* [PitchDetection](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/PitchDetection/PitchDetection)
* [PitchDetection_Game](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/PitchDetection/PitchDetection_Game)
* [PitchDetection_Piano](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/PitchDetection/PitchDetection_Piano)

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Model and Data Provenance
> A project started by [Ellen Nickles](https://github.com/ellennickles/)

### Models Overview

A nice description of the models overview

#### PitchDetection - Model Biography

- **Description**
  - This model is based on the pre-trained model, CREPE: A Convolutional REpresentation for Pitch Estimation.
- **Developer and Year**
  - CREPE was developed by researchers from NYU’s  Music and Audio Research Laboratory and Center for Urban Science and Progress in 2018.
- **Purpose and Intended Users**
  - According to the paper, CREPE “is made freely available as an open-source Python module for easy application” in the research area of Audio and Speech Processing.
- **Hosted Location**
  - TBD
- **ml5 Contributor and Year**
  - Ported by Hannah Davis in 2018
- **References**
  - ml5 Contributor [Hannah Davis](http://www.hannahishere.com/)
  - Website [Convolutional REpresentation for Pitch Estimation](https://marl.github.io/crepe/)
  - Paper [CREPE: A Convolutional Representation for Pitch Estimation](https://arxiv.org/abs/1802.06182)
  - GitHub Repository [CREPE](https://github.com/marl/crepe/tree/gh-pages)

#### PitchDetection - Data Biography

This model was trained on two datasets of synthesized audio: 

##### RWC-synth
- **Description**
  - This dataset contains 6.16 hours of audio synthesized from the RWC Music Database, a copyright-cleared database. According to the website, the “RWC Music Database contains six original collections: the Popular Music Database (100 songs), Royalty-Free Music Database (15 songs), Classical Music Database (50 pieces), Jazz Music Database (50 pieces), Music Genre Database (100 pieces), and Musical Instrument Sound Database (50 instruments).” 
- **Source**
  - RWC Music Database
- **Collector and Year**
  - RWC Music Database Sub-Working Group
- **Collection Method**
  - According to the RWC Music Database website, “For all 315 musical pieces performed and recorded for the database, we prepared original audio signals, corresponding standard MIDI files, and text files of lyrics (for songs). For the 50 instruments, we captured individual sounds at half-tone intervals with several variations of playing styles, dynamics, instrument manufacturers, and musicians.”
- **Purpose and Intended Users**
  - The data are available for research purposes only in the field of music information processing. According to the website, “these collections will provide a benchmark that enables researchers to compare and evaluate their various systems and methods against a common standard.”
- **References**
  - Website [RWC Music Database](https://staff.aist.go.jp/m.goto/RWC-MDB/)
  - Paper Masataka Goto, Hiroki Hashiguchi, Takuichi Nishimura, and Ryuichi Oka, “Rwc music database: Popular, classical and jazz music databases.,” in Proceedings of the 3rd ISMIR Conference, 2002, vol. 2, pp. 287–288.

##### Medly DB

- **Description**
  - This dataset consists of 15.56 hours re-synthesized 230 monophone stems. 
- **Source**
  - The stems are from Medly DB: A Dataset of Multitrack Audio for Music Research. There are currently two versions of the MedlyDB available, and the model’s paper cites the first one.
- **Collector and Year**
  - The MedlyDB project is led by Rachel Bittner at NYU's Music and Audio Research Lab.
- **Collection Method**
  - TBD
- **Purpose and Intended Users**
  - The Medley DB website describes it as a curated “dataset of annotated, royalty-free multitrack recordings” intended for research in the area of melody extraction.
- **References**
  - Website [Medly DB: A Dataset of Multitrack Audio for Music Research](https://medleydb.weebly.com/)
  - Website N [YU's Music and Audio Research Lab](http://steinhardt.nyu.edu/marl)
  - Paper Rachel M Bittner, Justin Salamon, Mike Tierney, Matthias Mauch, Chris Cannam, and Juan Pablo Bello, “Medleydb: A multitrack dataset for annotation-intensive mir research.,” in Proceedings of the 15th ISMIR Conference, 2014, vol. 14, pp. 155–160.


## Acknowledgements

**Contributors**:
  * Hannah Davis

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

[/src/PitchDetection](https://github.com/ml5js/ml5-library/tree/main/src/PitchDetection)
