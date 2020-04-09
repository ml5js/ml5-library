let sentenceEncoder;
const sentence = 'Monday, Tuesday, Wednesday, Thursday, and Friday are days of the Week';


function setup(){
  createCanvas(512, 512);
  // background(220);
  colorMode(HSB, 360, 100, 100);
  rectMode(CENTER);
  textAlign(CENTER);
  sentenceEncoder = ml5.universalSentenceEncoder({withTokenizer:true}, modelLoaded)
}

function modelLoaded(){
  console.log('model ready')
  predict();
}

function predict(){
  console.log('predicting')
  sentenceEncoder.encode(sentence, gotResults);
}

function gotResults(err, result){
  if(err){
    return err;
  }
  console.log(result);
  translate(40, 0);
  result.forEach( (item, idx) => {
    const rectHeight = map(item, 0, 7999, 0, 100);
    fill(180, 100, 100);
    rect(idx * 20, height/2 , 20,  rectHeight);
  })


}
