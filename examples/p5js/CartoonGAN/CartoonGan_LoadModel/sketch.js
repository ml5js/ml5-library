let cartoonGan;
let img;
let newImage;
function preload(){
  img = loadImage('MrBubz.jpg');
}

function setup(){
  createCanvas(160, 160);

  cartoonGan = ml5.cartoon("./model/model.json",modelLoaded)
  image(img, 0,0, width, height)
}

function modelLoaded(){
  cartoonGan.generate(img, gotResults)
}

function gotResults(err, result){
  if(err){
    return;
  }
  console.log(result)
  image(result.image, 0,0, 160, 160);
    
}

