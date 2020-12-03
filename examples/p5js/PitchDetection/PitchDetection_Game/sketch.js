// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
A game using pitch Detection with CREPE
=== */

// Pitch variables
let crepe;
const voiceLow = 100;
const voiceHigh = 500;
let audioStream;

// Circle variables
const circleSize = 42;
const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Text variables
let goalNote = 0;
let currentNote = '';
const currentText = '';
let textCoordinates;

function setup() {
  createCanvas(410, 320);
  textCoordinates = [width / 2, 30];
  gameReset();
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);
}

function startPitch() {
  pitch = ml5.pitchDetection('./model/', audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  select('#status').html('Model Loaded');
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      const midiNum = freqToMidi(frequency);
      currentNote = scale[midiNum % 12];
      select('#currentNote').html(currentNote);
    }
    getPitch();
  })
}

function draw() {
  background(240);
  // Goal Circle is Blue
  noStroke();
  fill(0, 0, 255);
  goalHeight = map(goalNote, 0, scale.length - 1, 0, height);
  ellipse(width / 2, goalHeight, circleSize, circleSize);
  fill(255);
  text(scale[goalNote], (width / 2) - 5, goalHeight + (circleSize / 6));
  // Current Pitch Circle is Pink
  if (currentNote) {
    currentHeight = map(scale.indexOf(currentNote), 0, scale.length - 1, 0, height);
    fill(255, 0, 255);
    ellipse(width / 2, currentHeight, circleSize, circleSize);
    fill(255);
    text(scale[scale.indexOf(currentNote)], (width / 2) - 5, currentHeight + (circleSize / 6));
    // If target is hit
    if (dist(width / 2, currentHeight, width / 2, goalHeight) < circleSize / 2) {
      hit(goalHeight, scale[goalNote]);
    }
  }
}

function gameReset() {
  goalNote = round(random(0, scale.length - 1));
  select('#target').html(scale[goalNote])
}

function hit(goalHeight, note) {
  noLoop();
  background(240);
  fill(138, 43, 226);
  ellipse(width / 2, goalHeight, circleSize, circleSize);
  fill(255);
  text(note, width / 2, goalHeight + (circleSize / 6));
  fill(50);
  select('#hit').html('Nice!')
  gameReset();
}