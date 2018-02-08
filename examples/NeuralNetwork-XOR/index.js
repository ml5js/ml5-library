let nn;
let training_data = [{
  inputs: [0, 0],
  targets: [0]
}, {
  inputs: [1, 0],
  targets: [1]
}, {
  inputs: [0, 1],
  targets: [1]
}, {
  inputs: [1, 1],
  targets: [0]
}];

// let lr_slider;

function setup() {
  createCanvas(200, 200);
  nn = new ml5.NeuralNetwork(2, 4, 1);
  // lr_slider = createSlider(0.01, 0.1, 0.05, 0.01);
}

function draw() {
  background(0);

  // nn.learningRate = lr_slider.value();

  for (let i = 0; i < 1; i++) {
    let data = random(training_data);
    nn.train(data.inputs, data.targets);
  }

  let resolution = 100;
  let cols = floor(width / resolution);
  let rows = floor(height / resolution);
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolution;
      let y = j * resolution;
      let input_1 = i / (cols - 1);
      let input_2 = j / (rows - 1);
      let output = nn.predict([input_1, input_2]);
      let col = output.results[0] * 255;
      //let col = random(255);
      fill(col);
      noStroke();
      rect(x, y, resolution, resolution);
    }
  }
  
}