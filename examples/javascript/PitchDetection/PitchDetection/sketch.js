

// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Basic Pitch Detection
=== */

let audioContext;
let mic;
let pitch;

async function setup() {
  audioContext = new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  startPitch(stream, audioContext);
}
setup();

function startPitch(stream, audioContext) {
  pitch = ml5.pitchDetection('./model/', audioContext , stream, modelLoaded);
}

function modelLoaded() {
  document.querySelector('#status').textContent='Model Loaded';
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      document.querySelector('#result').textContent = frequency;
    } else {
      document.querySelector('#result').textContent = 'No pitch detected';
    }
    getPitch();
  })
}

