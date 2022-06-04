let sentenceEncoder;
let textInput;

function setup(){
  createCanvas(512, 512);
  colorMode(HSB, 360, 100, 100);
  rectMode(CENTER);
  textInput = createInput('Monday, Tuesday, Wednesday, Thursday, and Friday are days of the week.');
  textInput.size(500);
  sentenceEncoder = ml5.universalSentenceEncoder({withTokenizer:false}, modelLoaded);
}

function modelLoaded(){
  console.log('model ready');
  // encode the current input.
  encode();
  // attach a listener to encode when the input is changed.
  textInput.input(encode);
}

function encode(){
  console.log('encoding');
  const sentence = textInput.value();
  sentenceEncoder.encode(sentence, gotResults);
}

function gotResults(err, result){
  if (err) {
    console.log(err);
    return;
  }
  console.log('got result:', result);
  clear();
  const padding = 20;
  const rectWidth = (width - 2 * padding)/result.length
  result.forEach( (item, idx) => {
    // Map from 8000 tokens in the vocab to a height from 0 to 100
    const rectHeight = map(item, 0, 7999, 0, 100);
    fill(180, 100, 100);
    const x = padding + (idx + .5) * rectWidth;
    rect(x, height/2 , rectWidth,  rectHeight);
  })
}
