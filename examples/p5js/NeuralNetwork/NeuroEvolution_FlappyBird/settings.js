//All the settings for the game
const settings = {
  width: 800,            //width of the canvas
  height: 360,           //height of the canvas
  startingPoint: 180,    //the x coordinate of the very first pipe that will spawn
  birdPosition: 80,      //x coordinate of birds
  birdSize: 25,          //the size of each bird
  gravity: 0.8,          //the gravity of the world
  pipeSpacing: 125,      //space beetween top and bottom of pipe
  pipeSize: 80,          //the size of each pipe
  worldSpeed: 3,         //the speed at which each pipe advances in the world
  spaceBetweenPipes: 375,//space between two different pipes
  popNum: 50,            //number of NN running simultaneusly AKA how many birdz
}

//Options for blank neural network (might consider adding to the settings object)
const options = {
  inputs: 5,                  //number of inputs nodes
  outputs: ['up', 'down'],    //two output nodes, see documentation about ouput label for more details
  task: 'classification',     //standard model type for FFW NN
  noTraining: true            //no dataset given, GAs are unsupervised methods
}