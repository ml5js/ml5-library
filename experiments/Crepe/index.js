var crepe;
var ellipseSize;
let voiceLow = 100;
let voiceHigh = 500;

function setup() {
  createCanvas(400, 300);
  noLoop();
  const videoElement = createCapture(AUDIO, stream => {
    console.log(AUDIO);
    videoElement.volume(0);
    console.log(videoElement);
    console.log('stream created');
    crepe = new ml5.Crepe(getAudioContext(), stream); 
    loop(); 
  });
  noStroke();
}

function parse(result){
    var splitResult = result.split(" Hz");
    return float(splitResult[0])
}

function draw() {
  if (!crepe){
    console.log("Crepe not yet initialized");
    return;
  }
  var results = crepe.getResults();
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

