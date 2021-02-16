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
let stream;

const width = 410;
const height = 320;

// Circle variables
const circleSize = 42;
const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Text variables
let goalNote = 0;
let currentNote = '';
const currentText = '';
let textCoordinates;
let canvas;

let request;
// taken from p5.Sound
function freqToMidi(f) {
  const mathlog2 = Math.log(f / 440) / Math.log(2);
  const m = Math.round(12 * mathlog2) + 69;
  return m;
};

function map(n, start1, stop1, start2, stop2) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  return newval;
};

async function setup() {
  canvas = createCanvas(width, height);
  textCoordinates = [width / 2, 30];
  gameReset();

  audioContext = new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });
  startPitch(stream, audioContext);

  requestAnimationFrame(draw)
}
setup()

function startPitch(stream, audioContext) {
  pitch = ml5.pitchDetection('./model/', audioContext, stream, modelLoaded);
}

function modelLoaded() {
  document.querySelector('#status').textContent = 'Model Loaded';
  getPitch();
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (frequency) {
      const midiNum = freqToMidi(frequency);
      currentNote = scale[midiNum % 12];
      document.querySelector('#currentNote').textContent = currentNote;
    }
    getPitch();
  })
}

function draw() {
  request = requestAnimationFrame(draw)
  clearCanvas();

  goalHeight = map(goalNote, 0, scale.length - 1, 0, height);
  // Goal Circle is Blue
  canvas.beginPath();
  canvas.arc(width / 2, goalHeight, circleSize, 0, 2 * Math.PI);
  canvas.strokeStyle = '#003300';
  canvas.stroke();

  canvas.fillText(scale[goalNote], (width / 2) - 5, goalHeight + (circleSize / 6));

  // Current Pitch Circle is Pink
  if (currentNote) {
    document.querySelector('#hit').textContent = '';
    currentHeight = map(scale.indexOf(currentNote), 0, scale.length - 1, 0, height);

    canvas.beginPath();
    canvas.arc(width / 2, currentHeight, circleSize, 0, 2 * Math.PI);
    canvas.strokeStyle = 'rgb(255, 0, 255)';
    canvas.stroke();


    canvas.fillText(scale[scale.indexOf(currentNote)], (width / 2) - 5, currentHeight + (circleSize / 6));
    // If target is hit
    if (dist(width / 2, currentHeight, width / 2, goalHeight) < circleSize / 2) {
      hit(goalHeight, scale[goalNote]);
    }
  }

}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
}

function gameReset() {
  goalNote = Math.round(Math.random() * (scale.length - 1));
  document.querySelector('#target').textContent = scale[goalNote];
}

function hit(goalHeight, note) {
  cancelAnimationFrame(request);
  canvas.beginPath();
  canvas.arc(width / 2, goalHeight, circleSize, 0, 2 * Math.PI);
  canvas.strokeStyle = 'rgb(138, 43, 226)';
  canvas.stroke();


  canvas.fillText(note, width / 2, goalHeight + (circleSize / 6));

  document.querySelector('#hit').textContent = 'Nice!';

  gameReset();

  requestAnimationFrame(draw);
}

// Clear the canvas
function clearCanvas() {
  canvas.fillStyle = '#ebedef'
  canvas.fillRect(0, 0, width, height);
}

function createCanvas(w, h) {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = w;
  canvasElement.height = h;
  document.body.appendChild(canvasElement);
  const canvas = canvasElement.getContext("2d");
  canvas.fillStyle = '#ebedef'
  canvas.fillRect(0, 0, w, h);
  return canvas;
}
