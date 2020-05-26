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

let canvas, ctx;

const width = 640;
const height = 480;

// taken from p5.Sound
function freqToMidi(f) {
  const mathlog2 = Math.log(f / 440) / Math.log(2);
  const m = Math.round(12 * mathlog2) + 69;
  return m;
}

function map(n, start1, stop1, start2, stop2) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  return newval;
}

async function setup() {
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext("2d");

  audioContext = new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  startPitch(stream, audioContext);

  requestAnimationFrame(draw);
}
setup();

function startPitch(stream, audioContext) {
  pitch = ml5.pitchDetection("./model/", audioContext, stream, modelLoaded);
}

function modelLoaded() {
  document.querySelector("#status").textContent = "Model Loaded";
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
  requestAnimationFrame(draw);
  drawKeyboard();
}

function drawKeyboard() {
  let whiteKeyCounter = 0;

  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.fill();

  // background(255);
  // strokeWeight(2);
  // stroke(50);

  // White keys
  for (let i = 0; i < scale.length; i += 1) {
    if (scale[i].indexOf("#") === -1) {
      ctx.beginPath();
      ctx.rect(
        cornerCoords[0] + whiteKeyCounter * rectWidth,
        cornerCoords[1],
        rectWidth,
        rectHeight,
      );
      if (scale[i] === currentNote) {
        ctx.fillStyle = "rgb(50, 50, 50)";
      } else {
        ctx.fillStyle = "rgb(250, 250, 250)";
      }
      ctx.fill();

      whiteKeyCounter += 1;
    }
  }
  whiteKeyCounter = 0;

  // Black keys
  for (let i = 0; i < scale.length; i += 1) {
    if (scale[i].indexOf("#") > -1) {
      ctx.beginPath();
      ctx.rect(
        cornerCoords[0] + whiteKeyCounter * rectWidth - rectWidth / 3,
        cornerCoords[1],
        rectWidth * keyRatio,
        rectHeight * keyRatio,
      );
      if (scale[i] === currentNote) {
        ctx.fillStyle = "rgb(100, 100, 100)";
      } else {
        ctx.fillStyle = "rgb(0, 0, 0)";
      }
      ctx.fill();
    } else {
      whiteKeyCounter += 1;
    }
  }
}
