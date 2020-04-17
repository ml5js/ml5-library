let sentenceEncoder;
const sentences = [
  'I love rainbows',
  'I love rainbows too',
  'I love cupcakes',
  'I love bagels more'
]

function setup(){
  createCanvas(512, 512);
  // background(220);
  colorMode(HSB, 360, 100, 100);
  sentenceEncoder = ml5.universalSentenceEncoder(modelLoaded)
}

function modelLoaded(){
  
  predict();
}

function predict(){
  
  sentenceEncoder.predict(sentences, gotResults);
}

function gotResults(err, result){
  if(err){
    return err;
  }
  console.log(result);

  result.forEach( (item, y) => {
    // console.log(item);
    item.forEach( (val, x) => {
      const l = map(val, -1, 1, 0, 100);
      noStroke();
      fill(360, 100, l);
      rect(x, y * (height/result.length) , 1,  (height/result.length));
    })
  })

}
