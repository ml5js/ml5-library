// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com


// A class to describe a population of particles

class Population {
  constructor(total) {
    this.population = [];
    this.generations = 0;  // Number of generations
    for (let i = 0; i < total; i++) {
      this.population[i] = new Particle();
    }
  }

  update() {
    for (const p of this.population) {
      p.think();
      p.update();
    }
  }

  show() {
    for (const p of this.population) {
      p.show();
    }
  }

  reproduce() {
    const brainA = this.pickOne();
    const brainB = this.pickOne();
    const childBrain = brainA.crossover(brainB);
    // 1% mutation rate
    childBrain.mutate(0.01);
    return new Particle(childBrain);
  }

  // Pick one parent probability according to normalized fitness
  pickOne() {
    let index = 0;
    let r = random(1);
    while (r > 0) {
      r = r - this.population[index].fitness;
      index++;
    }
    index--;
    return this.population[index].brain;
  }

  // Normalize all fitness values
  calculateFitness() {
    let sum = 0;
    for (const p of this.population) {
      sum += p.calcFitness();
    }
    for (const p of this.population) {
      p.fitness = p.fitness / sum;
    }
  }

  // Making the next generation
  reproduction() {
    const nextPopulation = [];
    // Refill the population with children from the mating pool
    for (let i = 0; i < this.population.length; i++) {
      nextPopulation[i] = this.reproduce();
    }
    this.population = nextPopulation;
    this.generations++;
  }
}