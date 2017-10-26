// Utils
// Activation Functions

// Activation Functions
let activationFunctions = {
  sigmoid: x => {
    return 1 / (1 + pow(Math.E, -x));
  },
  tanh: x => {
    return Math.tanh(x);
  }
}

// Derivatives
let derivatives = {
  sigmoid: x => {
    return x * (1 - x);
  },
  tanh: x => {
    return 1 / (pow(Math.cosh(x), 2))
  }
}

export { activationFunctions, derivatives }