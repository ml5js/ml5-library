//Function for the next generation
function nextGen() {
  console.log('next generation');

  //Array to store the new Population
  let newPop = []
  
  // Calculate fitness values
  calculateFitness();
  
  // Create new population of birds
  for (let i = 0; i < settings.popNum; i++) {
    newPop.push(reproduce());
  }
  
  //Put the new population in the original array
  birds = newPop
  
  //Initiate world pipes
  world.initPipes()
  
  //Reset dead count
  deads = 0
}

// Create a child bird from two parents 
function reproduce() {
  //Choose the best two bird in relation to their normalized fitness
  let brainA = pickOne();
  let brainB = pickOne();
  
  //Get the child from crossover the two parents
  let childBrain = brainA.crossover(brainB);
  
  //mutate the child with a 10% possibility to mutate
  childBrain.mutate(0.1);
  
  return new Bird(childBrain);
}

//Pick one parent probability according to normalized fitness
function pickOne() {
  let index = 0;
  let r = random(1);
  while (r > 0) {
      r = r - birds[index].fitness;
      index++;
  }
  index--;
  let bird = birds[index];
  return bird.brain;
}

// Normalize all fitness values
function calculateFitness() {
  let sum = 0;
  for (let bird of birds) {
    sum += bird.score;
  }
  for (let bird of birds) {
    bird.fitness = bird.score / sum;
  }
}
