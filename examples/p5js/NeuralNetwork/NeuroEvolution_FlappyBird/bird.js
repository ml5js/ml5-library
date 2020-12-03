// Daniel Shiffman
// Neuro-Evolution Flappy Bird with ml5.js

// Bird class

class Bird {
  constructor(brain) {
    this.y = height / 2;
    this.x = 64;

    this.gravity = 0.8;
    this.lift = -12;
    this.velocity = 0;

    this.score = 0;
    this.fitness = 0;

    // Bird can be created with an existing neural network
    if (brain) {
      this.brain = brain;
    } else {
      // Create a new neural network
      const options = {
        inputs: 5,
        outputs: ["up", "down"],
        task: "classification",
        noTraining: true,
      };
      this.brain = ml5.neuralNetwork(options);
    }
  }

  show() {
    stroke(255);
    fill(255, 100);
    ellipse(this.x, this.y, 32, 32);
  }

  up() {
    this.velocity += this.lift;
  }

  // Mutate the brain
  mutate() {
    // 10% mutation rate
    this.brain.mutate(0.1);
  }

  think(pipes) {
    // Find the closest pipe
    let closest = null;
    let closestD = Infinity;
    for (let i = 0; i < pipes.length; i += 1) {
      const d = pipes[i].x + pipes[i].w - this.x;
      if (d < closestD && d > 0) {
        closest = pipes[i];
        closestD = d;
      }
    }

    // Normalize 5 inputs
    const inputs = [];
    inputs[0] = this.y / height;
    inputs[1] = closest.top / height;
    inputs[2] = closest.bottom / height;
    inputs[3] = closest.x / width;
    inputs[4] = this.velocity / 10;

    // Jump according to neural network output
    const results = this.brain.classifySync(inputs);
    if (results[0].label === "up") {
      this.up();
    }
  }

  offScreen() {
    return this.y > height || this.y < 0;
  }

  update() {
    // Score increases each frame
    this.score += 1;
    this.velocity += this.gravity;
    this.y += this.velocity;
  }
}
