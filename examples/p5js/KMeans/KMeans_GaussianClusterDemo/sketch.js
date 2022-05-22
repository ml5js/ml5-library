let kmeansModel;
let clusterColors;

//  ----- Initialize the example: ------ //
function setup() {
  // make all those nice buttons
  makeButtons();
  // setup the drawing canvas
  const canvas = createCanvas(640, 480);
  // optional step: puts the canvas at a particular place in the document
  canvas.parent('#chart');
  // start with 3 cluster
  makeModel(3);
  // create different colors for each cluster
  clusterColors = [
    // you can use CSS color names, hex codes, or rgb values
    color('skyblue'),
    color('coral'),
    color('olive'),
    color('tan'),
    color('grey')
  ]
}

// STEP 1:
// create all the buttons
function makeButtons() {
  addClusterButton(2);
  addClusterButton(3);
  addClusterButton(4);
  addClusterButton('circle');
  addClusterButton('moon');
}


// STEP 2:
// create the model
function makeModel(clusterCount) {
  const options = {
    'k': clusterCount,
    'maxIter': 10,
    'threshold': 2,
  };
  // if moon or circle data, set the options to 2 clusters
  if (clusterCount === 'moon' || clusterCount === 'circle') {
    options.k = 2;
  }

  // get the path to the data in our data folder dynamically
  const dataPath = `data/gaussian2d_${clusterCount}clusters.csv`
  // create a new kmeans clustering each time on makeModel()
  kmeansModel = ml5.kmeans(dataPath, options, modelReady);
}

// STEP 3:
// when the model is ready, make the chart
function modelReady() {
  makeChart()
}

// STEP 4:
// use p5.js to make magic
function makeChart() {
  const dataset = kmeansModel.dataset;

  // clear the chart each time
  clear();

  // loop through all points and draw a circle for each one
  for (let i = 0; i < dataset.length; i++) {
    const point = dataset[i];
    const originalX = point[0];
    const originalY = point[1];
    const clusterIndex = point.centroid;

    // scale the values to fit our chart, with some padding
    // map from the input range of 0 to 1
    const padding = 20;
    const circleX = map(originalX, 0, 1, padding, width - padding);
    const circleY = map(originalY, 0, 1, padding, height - padding);

    // get the color based on the assigned cluster
    const circleColor = clusterColors[clusterIndex];
    noStroke();
    fill(circleColor);

    // draw the circle
    const diameter = 12;
    circle(circleX, circleY, diameter);
  }
}

// helper function to create a single button for a given cluster data set
function addClusterButton(clusterCount) {
  const button = createButton(`cluster: ${clusterCount}`);
  button.mousePressed(function () {
    makeModel(clusterCount);
  });
  // optional step: places the buttons above the chart
  button.parent(select('#buttons'));
}

