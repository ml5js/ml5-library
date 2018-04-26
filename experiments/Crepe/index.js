let crepe;
let ellipseSize;
const voiceLow = 100;
const voiceHigh = 500;

function setup() {
  createCanvas(500, 400);
  noLoop();
  const videoElement = createCapture(AUDIO, stream => {
    videoElement.volume(0);
    console.log('stream created');
    crepe = new ml5.Crepe(getAudioContext(), stream); 
    loop(); 
  });
  noStroke();
}

function parse(result){
    let splitResult = result.split(" Hz");
    return float(splitResult[0])
}

function draw() {
  if (!crepe){
    console.log("Crepe not yet initialized");
    return;
  }
  let results = crepe.getResults();
  if (results){
    if (results['result'] == "no voice"){
      newEllipseSize = 1;
      ellipseSize = lerp(ellipseSize, newEllipseSize, 0.1);
    }else{
      newEllipseSize = map(parse(results['result']), voiceLow, voiceHigh, 0, 500);
      ellipseSize = lerp(ellipseSize, newEllipseSize, 0.1);
    }
  }else{
    ellipseSize = 1;
  }
  background(0);
  fill(255);
  ellipse(width/2, height/2, ellipseSize, ellipseSize);
}

