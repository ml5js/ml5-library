//Array of all birds
let birds = []
//World 
let world
//Deads counter
let deads = 0
//Slider to spin up animation
let slider

function setup() {           
  //Sets default backend to cpu (see tf.js doc for more infos)
  ml5.tf.setBackend('cpu'); //improve performance on small Neural Networks (or so i read lol)
  
  //Creates a p5.js canvas
  createCanvas(settings.width, settings.height);   
  
  //Initialize the world and creates the slider
  world = new World ()
  slider = createSlider(1, 10, 1);

  //Initialize the popilation, asssigning each a random Neural Network (brain)
  for (let i = 0; i < settings.popNum; i++)
    birds.push(new Bird())
}

function draw() {                        
  for (let n = 0; n < slider.value(); n++) {	
    let closestPipe = world.getClosestPipe()
    //Updates the position and activates the brain on each living bird (see bird.js)
    birds.forEach(bird => {if (bird.alive) bird.run(closestPipe)})
    //Advances the pipes and create/delete existing ones (see world.js)
    world.run()
  }
  //Set the background to black
  background(0);       
  //If all birds are dead creates a new population (see ga.js)
  if (deads == settings.popNum) {nextGen()}
  //Draws each living bird and all the pipes
  birds.forEach(bird => {if (bird.alive) bird.draw()})
  world.draw()
}