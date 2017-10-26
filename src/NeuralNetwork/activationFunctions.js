// Utils
// Activation Functions

// Sigmoid function
const sigmoid = x => {
  return 1 / (1 + pow(Math.E, -x));
}

// Sigmoid derivative
const dSigmoid = x => {
  return x * (1 - x);
}

// Tanh function
const tanh = x => {
  return Math.tanh(x);
}

// Tanh derivative
const dtanh = x => {
  return 1 / (pow(Math.cosh(x), 2))
}


export { sigmoid, dSigmoid, tanh, dtanh }