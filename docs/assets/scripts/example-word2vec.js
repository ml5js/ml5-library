let wordVecs;

let wordVectors;

function setup() {
  createCanvas(100, 100);
  wordVectors = new p5ml.Word2Vec('assets/data/wordvecs/wordvecs10000.json');

  let loadHide = select("#loadHide");
  loadHide.hide();

  let nearWordInput = select('#nearword');
  let nearButton = select('#submit');
  let nearResults = select('#results');

  let betweenWordInput1 = select("#between1");
  let betweenWordInput2 = select("#between2");
  let betweenButton = select("#submit2");
  let betweenResults = select("#results2");

  let addInput1 = select("#isto1");
  let addInput2 = select("#isto2");
  let addInput3 = select("#isto3");
  let addButton = select("#submit3");
  let addResults = select("#results3");

  loadHide.show();
  noLoop();
  noCanvas();

  nearButton.mousePressed(() => {
    let word = nearWordInput.value();
    nearResults.html(findNearest(word, 10));
  });

  betweenButton.mousePressed(() => {
    let word1 = betweenWordInput1.value();
    let word2 = betweenWordInput2.value();
    let average = wordVectors.average([word1, word2], 1);
    betweenResults.html(average[0].vector);
  });

  addButton.mousePressed(() => {
    let is1 = addInput1.value();
    let to1 = addInput2.value();
    let is2 = addInput3.value();
    let difference = wordVectors.subtract([to1, is1]);
    let to2 = wordVectors.add([is2, difference[0].vector]);
    addResults.html(to2[0].vector);
  });
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(4);
  translate(width/2,height/2);
  rotate(frameCount * 0.5);
  line(0,0,width/2,0);
}

function findNearest(word, n=10) {
  let nearest = wordVectors.nearest(word, n);
  console.log('nearest', nearest);
  if (!nearest) {
    return 'No word vector found';
  }
  let output = '';
  for (let i = 0; i < nearest.length; i++) {
    output += nearest[i].vector + '<br/>';
  }
  return output;
}
