/*
===
Mnist Demo
deeplearn.js meets p5

This is a port of Daniel Shiffman Nature of Code: Intelligence and Learning
Original Repo: https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

Cristóbal Valenzuela
https://github.com/cvalenzuela/p5deeplearn
===
*/

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import { predict } from './predict';

let result, submit, drawing = false,
  next = false;

let sketch = new p5((p) => {

  p.setup = () => {
    let canvas = p.createCanvas(200, 200);
    p.pixelDensity(1);
    canvas.mousePressed(startDrawing);
    canvas.mouseReleased(stopDrawing);
    result = p.createP(' ');
    submit = p.createButton('classify');
    submit.mousePressed(classify);
    p.background(0);
  };

  p.draw = () => {
    if (drawing) {
      p.stroke(245);
      p.strokeWeight(20);
      p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
    }
  };

  let startDrawing = () => {
    drawing = true;
    if (next) {
      p.background(0);
      next = false;
    }
  }

  let stopDrawing = () => {
    drawing = false;
  }

  // Run the classification
  let classify = () => {
    let img = p.createImage(28, 28);
    let gray = [];

    img.copy(p.get(), 0, 0, p.width, p.height, 0, 0, 28, 28);
    img.loadPixels();
    let imgPixels = Array.from(img.pixels);

    for (let i = 0; i < 784; i++) {
      let value = imgPixels.slice(0, 3).reduce((sum, current) => {
        return sum + current
      }) / 3
      gray.push(p.float(p.norm(value, 0, 255).toFixed(3)))
      imgPixels.splice(0, 4)
    }
    next = true;
    predict(gray, result);

    // Debug: Draw the greyscale 28x28 image in the corner
    // copy(img.get(),0,0,28,28,0,0,28,28)  

  }

});