// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
A piano using pitch Detection with CREPE
=== */

// Pitch variables
let pitch;
let audioContext;
let audioStream;

// Keyboard variables
const cornerCoords = [10, 40];
const rectWidth = 90;
const rectHeight = 300;
const keyRatio = 0.58;
const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let currentNote = "";

function setup() {
  createCanvas(640, 520);
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);
}

function startPitch() {
  pitch = ml5.pitchDetection("./model/", audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  select("#status").html("Model Loaded");
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      const midiNum = freqToMidi(frequency);
      currentNote = scale[midiNum % 12];
    }
    getPitch();
  });
}

function draw() {
  drawKeyboard();
}

function drawKeyboard() {
  let whiteKeyCounter = 0;
  background(255);
  strokeWeight(2);
  stroke(50);
  // White keys
  for (let i = 0; i < scale.length; i += 1) {
    if (scale[i].indexOf("#") === -1) {
      if (scale[i] === currentNote) {
        fill(200);
      } else {
        fill(255);
      }
      rect(cornerCoords[0] + whiteKeyCounter * rectWidth, cornerCoords[1], rectWidth, rectHeight);
      whiteKeyCounter += 1;
    }
  }
  whiteKeyCounter = 0;

  // Black keys
  for (let i = 0; i < scale.length; i += 1) {
    if (scale[i].indexOf("#") > -1) {
      if (scale[i] === currentNote) {
        fill(100);
      } else {
        fill(0);
      }
      rect(
        cornerCoords[0] + whiteKeyCounter * rectWidth - rectWidth / 3,
        cornerCoords[1],
        rectWidth * keyRatio,
        rectHeight * keyRatio,
      );
    } else {
      whiteKeyCounter += 1;
    }
  }
}
