// Utils for sampling

// Sample from a distrubution
let sampleFromDistribution = input =>  {
  const randomValue = Math.random();
  let sum = 0,
    result;
  for (let j = 0; j < input.length; j++) {
    sum += input[j];
    if (randomValue < sum) {
      result = j;
      break;
    }
  }
  return result;

}

export { sampleFromDistribution }