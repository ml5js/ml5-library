---
id: word2vec-example
title: Word2Vec
---

A demostration of possible vector operations with words using the [Word2Vec](api-Word2vec.md) class.

## Demo

<div class="example">
  <style>
    .row {
      margin-top: 10px;
      padding: 20px;
      outline: 2px solid #ccc;
      outline-offset: -10px;
      -moz-outline-radius: 10px;
      -webkit-outline-radius: 10px;
    }
  </style>
  <div id="loadHide">
    <div class="row">
      <p>
        <input type="text" value="rainbow" id="nearword"></input>
        <button id="submit" class="btn btn-primary">is similar to ...</button>
      </p>
      <p id="results"></p>
    </div>
    <div class="row">
      <p>
        Between
        <input type="text" value="rainbow" id="between1"></input> and
        <input type="text" value="kitten" id="between2"></input>
        <button id="submit2" class="btn btn-primary">is ...</button>
      </p>
      <p id="results2"></p>
    </div>
    <div class="row">
      <p>
        <input type="text" value="king" id="isto1"></input> is to
        <input type="text" value="queen" id="isto2"></input> as
        <input type="text" value="man" id="isto3"></input>
        <button id="submit3" class="btn btn-primary">is to ...</button>
      </p>
      <p id="results3"></p>
    </div>
  </div>

  <script src="assets/scripts/example-word2vec.js"></script>
</div>

## Code

```javascript
let wordVecs;

let wordVectors;

function setup() {
  createCanvas(100, 100);
  wordVectors = new ml5.Word2Vec('data/wordvecs10000.json');

  let loadHide = select("#loadHide");
  loadHide.hide();

  let nearWordInput = select('#nearword');
  let nearButton = select('#submit');
  let nearResults = select('#results');

  let betweenWordInput1 = select("#between1");
  let betweenWordInput2 = select("#between2");
  let betweenButton = select("#submit2");
  let betweenResults = select("#results2");

  let addInput1 = select("#isto1");
  let addInput2 = select("#isto2");
  let addInput3 = select("#isto3");
  let addButton = select("#submit3");
  let addResults = select("#results3");

  loadHide.show();
  noLoop();
  noCanvas();

  nearButton.mousePressed(() => {
    let word = nearWordInput.value();
    nearResults.html(findNearest(word, 10));
  });

  betweenButton.mousePressed(() => {
    let word1 = betweenWordInput1.value();
    let word2 = betweenWordInput2.value();
    let average = wordVectors.average([word1, word2], 1);
    betweenResults.html(average[0].vector);
  });

  addButton.mousePressed(() => {
    let is1 = addInput1.value();
    let to1 = addInput2.value();
    let is2 = addInput3.value();
    let difference = wordVectors.subtract([to1, is1]);
    let to2 = wordVectors.add([is2, difference[0].vector]);
    addResults.html(to2[0].vector);
  });
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(4);
  translate(width/2,height/2);
  rotate(frameCount * 0.5);
  line(0,0,width/2,0);
}

function findNearest(word, n=10) {
  let nearest = wordVectors.nearest(word, n);
  console.log('nearest', nearest);
  if (!nearest) {
    return 'No word vector found';
  }
  let output = '';
  for (let i = 0; i < nearest.length; i++) {
    output += nearest[i].vector + '<br/>';
  }
  return output;
}

```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/word2vec)