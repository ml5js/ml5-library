let cartoonGan;
let video;

function setup(){
  createCanvas(400, 400);
  
  video = createCapture(VIDEO);
  video.size(256, 256);
  // hide the video element so we only see the transformed output
  video.hide();

  cartoonGan = ml5.cartoon(modelLoaded);
}

function modelLoaded(){
  // once the model is loaded call generate();
  generate();
}

function generate(){
  cartoonGan.generate(video, gotResults)
}

function gotResults(err, result){
  if(err){
    console.error(err);
    return;
  }

  // render this result
  image(result.image, 0,0, width, height);

  // call generate
  generate();
}

