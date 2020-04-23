//The agent class
class Bird {
  constructor(brain){
    //Fixed x position of birds  
    this.x = settings.birdPosition
    //Arbitrary starting point 
    this.y = settings.height/2
    //The gravity of the system
    this.gravity = settings.gravity
    //Size of the bird
    this.size = settings.birdSize
    //How "powerful" the jump is
    this.lift = 12
    //Velocity of the bird
    this.velocity = 0
    //Boolean to check if bird is still alive
    this.alive = true
    //Score of the bird
    this.score = 0
    //Fitness of the bird AKA normalized score
    this.fitness = 0
    //If a Neural Network is passed to the constructor creates a bird with that NN as its brain
    if (brain)
      this.brain = brain
    //Otherwise creates a new "blank" one using options from settings.js
    else 
      this.brain = new ml5.neuralNetwork(options)
  }
  //Draws the bird
  draw (){
    stroke(255);
    fill(255,100)
    ellipse(this.x, this.y, this.size, this.size) 
  }
  //Apllies physics to the bird
  fall(){
    this.velocity+=this.gravity
    this.y += this.velocity
  }
  //Simulate the jump of the bird
  jump (){
    this.velocity -= this.lift
  }  
  //Activates the NeuralNetwork using some normalized inputs
  move (pipe){
    const input =[
      this.y / settings.height,                             //the position of the bird
      this.velocity / 10,                                  //the velocity of the bird (100 is an arbitrary number)
      pipe.x / settings.width,                              //the x coordinate of the closest pipe
      pipe.y / settings.height,                             //height of the top pipe
      (pipe.y + settings.pipeSpacing) / settings.height     //height of the bottom pipe
    ]
    //Passes the inputs to the NN and stores its output
    const res = this.brain.classifySync(input)
    //If the NN is more confident to jump, then the bird jumps
    if (res[0].label == 'up')
      this.jump()
  }
  
  //Checks if the bird has hit the pipe/ground/floor
  checkCollision (closestPipe) {
    if ((this.x > closestPipe.x &&                        //
         this.x < closestPipe.x + world.pipeSize && !(    //    This checks for
         this.y > closestPipe.y &&                        //    the closest Pipe
         this.y < closestPipe.y + world.pipeSpacing)) ||  // 
        (this.y < 0 || this.y > settings.height)){        //Check for ground && floor
      //The bird is dead, updates its status 
      this.alive = false
      //Another one has died
      deads++
    }
    //If it is still alive, then moves using its NN (brain)
    else 
      this.move(closestPipe)
  }
  
  //Main function:
  //Applies Physichs
  //Check hit & activates Neural Network
  //Increase its score
  run (closestPipe){
    this.fall()
    this.checkCollision(closestPipe)
    this.score++
  }
}