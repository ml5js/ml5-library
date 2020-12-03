let sentiment;
let statusEl;
let submitBtn;
let inputBox;
let sentimentResult;

function setup() {
  noCanvas();
  // initialize sentiment
  sentiment = ml5.sentiment('movieReviews', modelReady);

  // setup the html environment
  statusEl = createP('Loading Model...');
  inputBox = createInput('Today is the happiest day and is full of rainbows!');
  inputBox.attribute('size', '75');
  submitBtn = createButton('submit');
  sentimentResult = createP('sentiment score:');

  // predicting the sentiment on mousePressed()
  submitBtn.mousePressed(getSentiment);
}

function getSentiment() {
  // get the values from the input
  const text = inputBox.value();

  // make the prediction
  const prediction = sentiment.predict(text);

  // display sentiment result on html page
  sentimentResult.html(`Sentiment score: ${prediction.score}`);
}

function modelReady() {
  // model is ready
  statusEl.html('model loaded');
}
