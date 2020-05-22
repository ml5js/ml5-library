// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// How long should each generation live
let lifetime;
let lifeCounter;

// Population
let population;

// Target position
let target;

// Interface
let info;
let slider;

function setup() {
  const canvas = createCanvas(600, 600);

  // Move the target if you click on the canvas
  canvas.mousePressed(function() {
    target.x = mouseX;
    target.y = mouseY;
  });

  // Improve performance for many small neural networks
  ml5.tf.setBackend("cpu");

  // The number of cycles we will allow a generation to live
  lifetime = 200;
  lifeCounter = 0;

  // Arbitrary starting target
  target = createVector(20, height / 2);

  // Create a population N Particles
  population = new Population(100);

  // Interface
  info = createP("");
  // Slider for speeding up simulation
  slider = createSlider(1, 50, 1);
}

function draw() {
  // Update the population
  for (let n = 0; n < slider.value(); n += 1) {
    if (lifeCounter < lifetime) {
      population.update();
      lifeCounter += 1;
      // Otherwise a new generation
    } else {
      lifeCounter = 0;
      // Next generation
      population.calculateFitness();
      population.reproduction();
    }
  }

  // Draw target
  background(0);
  fill(100, 255, 100);
  stroke(255);
  rectMode(CENTER);
  rect(target.x, target.y, 24, 24);

  // Show population
  population.show();

  // Display some info
  info.html(`Generation # ${population.generations}<br>Cycles left: ${lifetime - lifeCounter}`);
}
