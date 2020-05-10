// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

class Particle {
  constructor(brain) {
    // All of our physics stuff
    this.position = createVector(width/2, height/2);
    this.acceleration = createVector();
    this.velocity = createVector();
    // Fitness and DNA
    this.fitness = 0;
    // Bird can be created with an existing neural network
    if (brain) {
      this.brain = brain;
    } else {
      // Create a new neural network
      const options = {
        inputs: 2,
        outputs: 2,
        task: 'regression',
        noTraining: true
      }      
      this.brain = ml5.neuralNetwork(options);
      this.brain.mutate(1);
    }
  }

  // fitness = one divided by distance squared
  calcFitness() {
    const d = p5.Vector.dist(this.position, target);
    this.fitness = pow(1 / d, 2);
    return this.fitness;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  // Run in relation to all the obstacles
  // If I'm stuck, don't bother updating or checking for intersection
  think() {
    const inputs = [];
    inputs[0] = this.position.x / width;
    inputs[1] = this.position.y / height;
    const outputs = this.brain.predictSync(inputs);
    this.velocity = p5.Vector.fromAngle(outputs[0].value * TWO_PI);
    this.velocity.mult(outputs[1].value * 5);

    // let force = p5.Vector.fromAngle(angle);
    // force.mult(mag);
    // this.applyForce(force);
  }
  

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  show() {
    stroke(255);
    fill(255, 150);
    ellipse(this.position.x, this.position.y, 8);
  }
}