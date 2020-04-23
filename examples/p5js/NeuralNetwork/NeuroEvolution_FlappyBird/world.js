//ZA WARUDO class
class World {
  constructor () {
    //Array to store all pipes
    this.pipes = []
    //Space beetween top and bottom of pipe
    this.pipeSpacing = settings.pipeSpacing
    //The size of each pipe
    this.pipeSize = settings.pipeSize
    //The speed at which each pipe advances in the world
    this.speed = settings.worldSpeed
    //Space between two different pipes
    this.spaceBetweenPipes = settings.spaceBetweenPipes
    this.initPipes()
  }

  //Draw each pipe 
  draw () {
    this.pipes.forEach ( pipe => pipe.draw(this.pipeSpacing, this.pipeSize) )
  }

  //Advance each pipe
  advance () {
    this.pipes.forEach ( pipe => pipe.advance(this.speed) )
  }

  //Creates a new pipe at the end of canvas
  createNewPipe () {
    this.pipes.push(new Pipe(this.pipes[this.pipes.length-1].x + this.spaceBetweenPipes, Math.floor(Math.random() * (settings.height - this.pipeSpacing))))
  }

  //Initialize 5 (arbitrary number) pipes 
  //required in order to trigger deleteLastPipe() 
  initPipes () {
    this.pipes = []
    for (let i = 0; i < 5; i++)
      this.pipes.push(new Pipe(settings.startingPoint + i * this.spaceBetweenPipes, Math.floor(Math.random() * (settings.height - this.pipeSpacing))))
  }
  
  //Deletes last pipe if it is out of the canvas and creates a new one
  deleteLastPipe () {
    if (this.pipes[0].x + this.pipeSize < 0) {
      this.pipes.shift()
      this.createNewPipe()
    }
  }
  //Returns the closest pipe to the bird
  getClosestPipe () {
    if (this.pipes[0].x + this.pipeSize < settings.birdPosition)
      return this.pipes[1]
    else 
      return this.pipes[0]
  }
  //Checks for deleted pipes and advance them
  run () {
    this.deleteLastPipe()
    this.advance()
  }
}

