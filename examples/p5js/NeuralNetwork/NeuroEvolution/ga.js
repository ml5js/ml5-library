// Daniel Shiffman
// Neuro-Evolution Flappy Bird

function nextGeneration() {
  console.log('next generation');
  calculateFitness();
  
  // Create a new population
  for (let i = 0; i < TOTAL; i++) {
    birds[i] = reproduce();
  }

  // Release all the memory
  for (let i = 0; i < TOTAL; i++) {
    savedBirds[i].brain.dispose();
  }
  savedBirds = [];
}

function reproduce() {
  let brainA = pickOne();
  let brainB = pickOne();
  let childBrain = brainA.crossover(brainB);
  childBrain.mutate(0.1);
  return new Bird(childBrain);
}

function pickOne() {
  let index = 0;
  let r = random(1);
  while (r > 0) {
    r = r - savedBirds[index].fitness;
    index++;
  }
  index--;
  let bird = savedBirds[index];
  return bird.brain;
}

function calculateFitness() {
  let sum = 0;
  for (let bird of savedBirds) {
    sum += bird.score;
  }
  for (let bird of savedBirds) {
    bird.fitness = bird.score / sum;
  }
}
