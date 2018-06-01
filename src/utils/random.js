// Copyright (c) 2018 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Random

// Returns a random number between min (inclusive) and max (exclusive)
const randomFloat = (min = 0, max = 1) => (Math.random() * (max - min)) + min;

// Returns a random integer between min (inclusive) and max (inclusive)
const randomInt = (min = 0, max = 1) => Math.floor(Math.random() * ((max - min) + 1)) + min;

// Random Number following a normal dist.
// Taken from https://github.com/processing/p5.js/blob/master/src/math/random.js#L168
const randomGaussian = (mean = 0, sd = 1) => {
  let y1;
  let y2;
  let x1;
  let x2;
  let w;
  let previous;
  if (previous) {
    y1 = y2;
    previous = false;
  } else {
    do {
      x1 = randomFloat(0, 2) - 1;
      x2 = randomFloat(0, 2) - 1;
      w = (x1 * x1) + (x2 * x2);
    } while (w >= 1);
    w = Math.sqrt((-2 * Math.log(w)) / w);
    y1 = x1 * w;
    y2 = x2 * w;
    previous = true;
  }
  return (y1 * sd) + mean;
};

export { randomFloat, randomInt, randomGaussian };
