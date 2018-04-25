console.log('in crepe');


var capture;
var crepe;
var ellipseSize;
var pastEllipseSize = 1;

function setup() {
  console.log('in setup');
  createCanvas(390, 240);
  crepe = new ml5.Crepe(getAudioContext());
  //console.log(getAudioContext());
  // capture = createCapture(AUDIO, function(){
  //     console.log(capture);
  //     var crepe = new ml5.Crepe(capture);
  // });
  //capture.size(320, 240);
}

function parse(result){
    var splitResult = result.split(" Hz");
    console.log(float(splitResult[0]));
    return float(splitResult[0])
}

function draw() {
  var results = crepe.getResults();
  if (results){
      console.log("past ", pastEllipseSize);
    if (results['result'] == "no voice"){
        newEllipseSize = 1;
        console.log("new ", newEllipseSize);
        ellipseSize = lerp(pastEllipseSize, newEllipseSize, 0.1);
        console.log("ellipse size: ", ellipseSize);
    }else{
        newEllipseSize = map(parse(results['result']), 0, 1200, 0, 300);
        console.log("new ", newEllipseSize);
        ellipseSize = lerp(pastEllipseSize, newEllipseSize, 0.1);
        console.log("ellipse size: ", ellipseSize);
    }
  }else{
    ellipseSize = 1;
  }
  console.log('\n');
  background(0);
  fill(255);
  noStroke();

  ellipse(200, 150, ellipseSize, ellipseSize);
  pastEllipseSize = ellipseSize;
}

