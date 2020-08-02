// Daniel Shiffman
// Neuro-Evolution Flappy Bird with ml5.js

// Genetic Algorithm Functions
// TODO: create a ml5.population() class to manage this?

// Create the next generation
function nextGeneration() {
  console.log("next generation");
  // Calculate fitness values
  calculateFitness();

  // Create new population of birds
  for (let i = 0; i < TOTAL; i += 1) {
    birds[i] = reproduce();
  }

  // Release all the memory
  for (let i = 0; i < TOTAL; i += 1) {
    savedBirds[i].brain.dispose();
  }
  // Clear the array
  savedBirds = [];
}

// Create a child bird from two parents
function reproduce() {
  const brainA = pickOne();
  const brainB = pickOne();
  const childBrain = brainA.crossover(brainB);
  childBrain.mutate(0.1);
  return new Bird(childBrain);
}

// Pick one parent probability according to normalized fitness
function pickOne() {
  let index = 0;
  let r = random(1);
  while (r > 0) {
    r -= savedBirds[index].fitness;
    index += 1;
  }
  index -= 1;
  const bird = savedBirds[index];
  return bird.brain;
}

// Normalize all fitness values
function calculateFitness() {
  let sum = 0;
  for (const bird of savedBirds) {
    sum += bird.score;
  }
  for (const bird of savedBirds) {
    bird.fitness = bird.score / sum;
  }
}
