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
  document.querySelector('#status').innerHTML = 'Model Loaded';
}

function setup() {
  
  // Create the Word2Vec model with pre-trained file of 10,000 words
  word2Vec = ml5.word2vec('data/wordvecs10000.json', modelLoaded);

  // Select all the DOM elements
  const nearWordInput = document.querySelector('#nearword');
  const nearButton = document.querySelector('#submit');
  const nearResults = document.querySelector('#results');

  const betweenWordInput1 = document.querySelector("#between1");
  const betweenWordInput2 = document.querySelector("#between2");
  const betweenButton = document.querySelector("#submit2");
  const betweenResults = document.querySelector("#results2");

  const addInput1 = document.querySelector("#isto1");
  const addInput2 = document.querySelector("#isto2");
  const addInput3 = document.querySelector("#isto3");
  const addButton = document.querySelector("#submit3");
  const addResults = document.querySelector("#results3");

  // Finding the nearest words
  nearButton.addEventListener('click', () => {
    const word = nearWordInput.value;
    word2Vec.nearest(word, (err, result) => {
      let output = '';
      if (result) {
        for (let i = 0; i < result.length; i += 1) {
          output += `${result[i].word  }<br/>`;
        }
      } else {
        output = 'No word vector found';
      }
      nearResults.innerHTML  = output;
    });
  });

  // Finding the average of two words
  betweenButton.addEventListener('click',() => {
    const word1 = betweenWordInput1.value;
    const word2 = betweenWordInput2.value;
    word2Vec.average([word1, word2], 4, (err, average) => {
      betweenResults.innerHTML = average[0].word;
    })
  });

  // Adding two words together to "solve" an analogy
  addButton.addEventListener('click',() => {
    const is1 = addInput1.value;
    const to1 = addInput2.value;
    const is2 = addInput3.value;
    word2Vec.subtract([to1, is1])
      .then(difference => word2Vec.add([is2, difference[0].word]))
      .then(result => { addResults.innerHTML = result[0].word })
  });
}

setup();