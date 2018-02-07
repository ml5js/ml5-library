/*
===
Simple Teachable Machine (gif output) Demo

Nov 2017:
Original version by @yining1023

Feb 2018:
Sound output added by @achimkoh
===
*/

let knn;
let video;
let isPredicting = false;
let prevIsPredicting = false;
let exampleCounts = new Array(3).fill(0);
let timers = new Array(3);

let predictimer;
let outputSrc;
let updateGifIndex;
let uploadBtn;

const msgArray = ['A', 'B', 'C'];
let gifSrcs = ['output0.gif', 'output1.gif', 'output2.gif'];
let soundSrcs = ['jazz-guitar.mp3', 'crickets.mp3', 'amenbreak.mp3'];
let soundfiles = [];
let outputGif = true;
let outputSound = false;

function preload() {
  // Initialize the KNN method.
  knn = new ml5.KNNImageClassifier(modelLoaded, 3, 1);
  // Load sound files
  soundSrcs.forEach( (src) => soundfiles.push( loadSound('sounds/' + src) ) );
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  background(0);
  video = createCapture(VIDEO);
  video.size(227, 227);
  video.hide();

  uploadBtn = createFileInput(imageUpload);
  uploadBtn.id('uploadbtn');
  uploadBtn.hide();

  // Initialize sound loops
  soundfiles.forEach( (s) => { 
                      s.setVolume(0); 
                      s.loop();
                      s.play(); 
                    });
  // sound filenames
  msgArray.forEach((id, index) => {
    let div = select('#sound' + id);
    div.elt.innerText = soundSrcs[index];
  });

  // Train buttons
  msgArray.forEach((id, index) => {
    let button = select('#button' + id);
    button.mousePressed(() => {
      if (timers[index]) clearInterval(timers[index]);
      timers[index] = setInterval(() => { train(index); }, 100);
    });

    button.mouseReleased(() => {
      if (timers[index]) {
        clearInterval(timers[index]);
        updateExampleCounts();
      }
    });
  });

  // Reset buttons
  msgArray.forEach((id, index) => {
    let button = select('#reset' + id);
    button.mousePressed(() => {
      clearClass(index);
      updateExampleCounts();
    });
  });

  // Initiate the behavior of GIF/Sound output toggle controls
  let labels = selectAll("label");
  labels.forEach( (e) => { e.mouseClicked(toggleOutput); 
                           // Same behavior also for each radio input tied with the label; otherwise behavior tends to break after first toggle
                           e.elt.control.onclick=toggleOutput; } );
}

function draw() {
  background(0);
  push(); // flip video direction so it works like a mirror
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
  pop();
}

// A function to be called when the model has been loaded
function modelLoaded() {
  // select('#loading').html('Model loaded!');
}

// Train the Classifier on a frame from the video.
function train(category) {
  knn.addImage(video.elt, category);
}

// Predict the current frame.
function predict() {
  knn.predict(video.elt, gotResults);
}

// Show the results
function gotResults(results) {
  if (results.classIndex < 0) return;
  updateConfidence(results.confidences);
  updateGif(results);
  updateSound(results);
  if (isPredicting) predictimer = setTimeout(() => predict(), 50);
}

function updateConfidence(confidences) {
  for (let j = 0; j < msgArray.length; j++) {
    select('#progress-text' + msgArray[j]).html( confidences[j] * 100 + ' %');
    select('#progress-bar' + msgArray[j]).style('width', confidences[j] * 100 + '%');
  }
}

// Clear the data in one class
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

function updateGif(results) {
  // Display different gifs
  if (results.classIndex < 0) return;
  if (outputSrc !== gifSrcs[results.classIndex]) {
    outputSrc = gifSrcs[results.classIndex];
    select('#output').elt.src = outputSrc;
  }
}

function updateExampleCounts() {
  let counts = knn.getClassExampleCount();
  exampleCounts = counts.slice(0, 3);
  exampleCounts.forEach((count, index) => {
    select('#example' + msgArray[index]).html(count + ' EXAMPLES');
  });

  updateIsPredicting();
}

function updateIsPredicting() {
  prevIsPredicting = isPredicting;
  isPredicting = exampleCounts.some(e => e > 0);
  if (prevIsPredicting !== isPredicting) {
    if (isPredicting) {
      predict();
    } else {
      clearTimeout(predictimer);
      resetResult();
    }
  }
}

function resetResult() {
  select('#output').elt.src = 'default.png';
  soundfiles.forEach( (s) => s.setVolume(0, 0.2) );
  msgArray.forEach((id, index) => {
    select('#sound' + id).removeClass("playing");
  });
  updateConfidence(exampleCounts);
}

function uploadGif(index) {
  updateGifIndex = index;
  uploadBtn.elt.click();
}

function imageUpload(file) {
  gifSrcs[updateGifIndex] = file.data;
  select('#img' + msgArray[updateGifIndex]).elt.src = file.data;
  select('#output').elt.src = file.data;
}

function updateSound(results) {
  if (results.classIndex < 0) return;
  if (!outputSound) { soundfiles.forEach( (s) => { s.setVolume(0); } ); return; }
  if (soundfiles[results.classIndex].getVolume() == 0) {
    for (let i=0; i<soundfiles.length; i++) {
      if (i == results.classIndex) {
        soundfiles[i].setVolume(0.8, 0.5);
        select('#sound' + msgArray[i]).addClass("playing");
      } else {
        soundfiles[i].setVolume(0, 0.5);
        select('#sound' + msgArray[i]).removeClass("playing");
      }
    }
  }
}

function toggleOutput() {
  let radio, gifDisplay, soundDisplay;
  if (this.tagName == "LABEL") radio = this.control; else radio = this;
  if (radio.id === "option-gif") {
    gifDisplay = "block";
    soundDisplay = "none";
    outputGif = true;
    outputSound = false;
  } else {
    gifDisplay = "none";
    soundDisplay = "block";        
    outputGif = false;
    outputSound = true;
  }
  select("#gif-output").style("display", gifDisplay);
  select("#sound-output").style("display", soundDisplay);
}