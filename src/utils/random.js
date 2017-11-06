// Random

// Returns a random number between min (inclusive) and max (exclusive)
let randomFloat = (min = 0, max = 1) => {
  return Math.random() * (max - min) + min;
};

// Returns a random integer between min (inclusive) and max (inclusive)
let randomInt = (min = 0, max = 1) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random Number following a normal dist. 
// Taken from https://github.com/processing/p5.js/blob/master/src/math/random.js#L168
let randomGaussian = (mean = 0, sd = 1) => {
  let y1, y2, x1, x2, w;
  let previous;
  if (previous) {
    y1 = y2;
    previous = false;
  } else {
    do {
      x1 = randomFloat(0, 2) - 1;
      x2 = randomFloat(0, 2) - 1;
      w = x1 * x1 + x2 * x2;
    } while (w >= 1);
    w = Math.sqrt((-2 * Math.log(w)) / w);
    y1 = x1 * w;
    y2 = x2 * w;
    previous = true;
  }
  return y1 * sd + mean;
};

export { randomFloat, randomInt, randomGaussian }