//Very basic class for each pipe
class Pipe {
  constructor (x, y){
    this.x = x  //x coordinate of the pipe
    this.y = y  //y coordinate of the OPENING           
  }
  //Moves the pipe back 
  advance (speed) {
    this.x -= speed
  }
  //Draws the pipe
  draw (spacing, pipesize) {
    //green because the original was green
    fill(0,255,0)
    //draws upper pipe
    rect(this.x, 0, pipesize, this.y)    
    //draws lower pipe
    rect(this.x, this.y+spacing, pipesize, settings.height)		
  }
}