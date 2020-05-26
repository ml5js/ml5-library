// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Word2Vec example with p5.js. Using a pre-trained model on common English words.
=== */

let word2Vec;

function modelLoaded() {
  select('#status').html('Model Loaded');
}

function setup() {
  noLoop();
  noCanvas();

  // Create the Word2Vec model with pre-trained file of 5000 words
  word2Vec = ml5.word2vec('data/wordvecs5000.json', modelLoaded);

  // Select all the DOM elements
  const nearWordInput = select('#nearword');
  const nearButton = select('#submit');
  const nearResults = select('#results');

  const betweenWordInput1 = select("#between1");
  const betweenWordInput2 = select("#between2");
  const betweenButton = select("#submit2");
  const betweenResults = select("#results2");

  const addInput1 = select("#isto1");
  const addInput2 = select("#isto2");
  const addInput3 = select("#isto3");
  const addButton = select("#submit3");
  const addResults = select("#results3");

  // Finding the nearest words
  nearButton.mousePressed(() => {
    const word = nearWordInput.value();
    word2Vec.nearest(word, (err, result) => {
      let output = '';
      if (result) {
        for (let i = 0; i < result.length; i += 1) {
          output += `${result[i].word  }<br/>`;
        }
      } else {
        output = 'No word vector found';
      }
      nearResults.html(output);
    });
  });

  // Finding the average of two words
  betweenButton.mousePressed(() => {
    const word1 = betweenWordInput1.value();
    const word2 = betweenWordInput2.value();
    word2Vec.average([word1, word2], 4, (err, average) => {
      betweenResults.html(average[0].word);
    })
  });

  // Adding two words together to "solve" an analogy
  addButton.mousePressed(() => {
    const is1 = addInput1.value();
    const to1 = addInput2.value();
    const is2 = addInput3.value();
    word2Vec.subtract([to1, is1])
      .then(difference => word2Vec.add([is2, difference[0].word]))
      .then(result => addResults.html(result[0].word))
  });
}
