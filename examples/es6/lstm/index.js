/*
===
RNN/LSTM
deeplearn.js meets p5

This is a port of Daniel Shiffman Nature of Code: Intelligence and Learning
Original Repo: https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

Cristóbal Valenzuela
https://github.com/cvalenzuela/p5deeplearn
===
*/

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import { generateText } from './lstm';

let textInput, tempSlider, lengthSlider, maxlen = 40,
  waiting = false;

let sketch = new p5((p) => {

  p.setup = () => {
    p.noCanvas();

    // Grab the DOM elements
    textInput = p.select('#textInput');
    lengthSlider = p.select('#lenSlider');
    tempSlider = p.select('#tempSlider');

    // Run generate anytime something changes
    textInput.input(generate);
    lengthSlider.input(generate);
    tempSlider.input(generate);
  };

  let generate = () => {

    // Update the length and temperature span elements
    p.select('#length').html(lengthSlider.value())
    p.select('#temperature').html(tempSlider.value())

    // Grab the original text
    let original = textInput.value();
    // Make it to lower case
    let txt = original.toLowerCase();

    // while (txt.length < maxlen) {
    //   txt += original.toLowerCase();
    // }
    if (txt.length > maxlen) {
      txt = txt.substring(txt.length - maxlen, txt.length);
    }

    // Here is the data to post
    let data = {
      seed: txt,
      temperature: tempSlider.value(),
      length: lengthSlider.value()
    }

    let success = result => {
      p.select('#original').html(original);
      p.select('#prediction').html(result.sentence);
    }

    let result = generateText(data, success);
  }


});