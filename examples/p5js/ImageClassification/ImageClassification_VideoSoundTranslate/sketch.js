// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
=== */

let classifier;
let video;
let langDropdown;
let selectedLang = "zh-CN";
// Before you run this example, you need to put in your own Google translate API key below</p>
// You will need to register and generate and get Google API key and also enable the Google Translate API in the Google Console.
// Read more here: https://cloud.google.com/translate/docs/quickstart-client-libraries#client-libraries-install-nodejs
const translateAPIKey = "Xxxxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxxxxxx";
// Create a new p5.speech object
// You can also control the Language, Rate, Pitch and Volumn of the voice
// Read more at http://ability.nyu.edu/p5.js-speech/
const myVoice = new p5.Speech();

function setup() {
  // Select a default voice and langauge
  myVoice.setLang("zh-CN");
  myVoice.setVoice(63);

  noCanvas();
  // Create a camera input
  video = createCapture(VIDEO);
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier("MobileNet", video, modelReady);

  langDropdown = select("#lang");
  langDropdown.changed(langChangedEvent);
}

function modelReady() {
  // Change the status of the model once its ready
  select("#status").html("Model Loaded");
  // Call the classifyVideo function to start classifying the video
  classifyVideo();
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotResult);
}

// When we get a result
function gotResult(err, results) {
  // The results are in an array ordered by confidence.
  const resultText = results[0].label;
  select("#result").html(resultText);
  select("#probability").html(nf(results[0].confidence, 0, 2));

  // Get the first word of the result
  const resultWord = resultText.split(",")[0];
  // Translate the result to another language using Google translate API
  const url = `https://www.googleapis.com/language/translate/v2/?key=${translateAPIKey}&target=${selectedLang}&source=en&q=${resultWord}`;
  loadJSON(url, gotTranslation);
}

function gotTranslation(result) {
  if (result && result.data && result.data.translations) {
    const translatedRes = result.data.translations[0].translatedText;
    // Show the translated result
    select("#translatedResult").html(translatedRes);
    // Speak out the result
    myVoice.speak(translatedRes);
    // Continue to classify the view
    classifyVideo();
  }
}

function langChangedEvent() {
  selectedLang = langDropdown.value();
  // Set language
  myVoice.setLang(selectedLang);
  switch (selectedLang) {
    case "zh-CN":
      myVoice.setVoice(63);
      break;
    case "es":
      myVoice.setVoice(52);
      break;
    case "fr":
      myVoice.setVoice(54);
      break;
    default:
      myVoice.setVoice(63);
  }
}
