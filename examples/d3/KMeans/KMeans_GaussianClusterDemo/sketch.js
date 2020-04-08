let kmeansModel;
const width = 640;
const height = 480;
const colDict = {
  0: 'skyblue',
  1: 'coral',
  2: 'olive',
  3: 'tan',
  4: 'grey'
}

//  ----- Initialize the example: ------ //
function init() {
  // make all those nice buttons
  createButtons();
  // start with 3 cluster
  make(3);
}
init();

// STEP 1:
// create all the buttons
function createButtons() {
  addClusterButton(2);
  addClusterButton(3);
  addClusterButton(4);
  addClusterButton('circle');
  addClusterButton('moon');
}

// STEP 2:
// create the model
function make(currentClusterCount) {
  const options = {
    'k': currentClusterCount,
    'maxIter': 10,
    'threshold': 2,
  };
  // if moon or circle data, set the options to 2 clusters
  // could also be a 1-liner: options.k = (currentClusterCount === 'moon' || currentClusterCount === 'circle') ? 2: options.k;
  if(currentClusterCount === 'moon' || currentClusterCount === 'circle'){
    options.k = 2;
  }
  console.log(currentClusterCount, options.k);

  
  // get the path to the data in our data folder dynamically
  const dataPath = `data/gaussian2d_${currentClusterCount}clusters.csv`
  // create a new kmeans clustering each time on make()
  kmeansModel = ml5.kmeans(dataPath, options, modelReady);

}

// Step 3:
// when the model is ready, make the chart
function modelReady() {
  makeChart()
}

// Step 4: 
// use the fancy d3 to make magic
function makeChart() {
  const dataset = kmeansModel.dataset;
  // clear the chart each time
  // less efficient, but simple
  d3.select('svg').remove();

  // reappend the svg to the chart area
  const svg = d3.select('#chart').append('svg')
    .attr('width', width)
    .attr('height', height);

  // d[0] is for the x value in the array
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, d => d[0]))
    .range([10, width - 100]);

  // d[1] is for the y value in the array
  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, d => d[1]))
    .range([height - 50, 20]);

  svg.selectAll('circle').data(dataset)
    .enter().append('circle')
    .attr('cx', d => xScale(d[0]))
    .attr('cy', d => yScale(d[1]))
    .attr('r', 6)
    .attr('fill', 'black')

  d3.select('svg').selectAll('circle')
    .transition()
    .attr('fill', (d, i) => colDict[dataset[i].centroid]);

}

// adds the buttons for the respective cluster data
// we could also use d3.append() and d3.select() here :)
function addClusterButton(currentClusterCount) {
  const btn = document.createElement("BUTTON");
  btn.innerText = `cluster: ${currentClusterCount}`

  btn.addEventListener('click', function (e) {
    make(currentClusterCount);
  });

  document.querySelector('#buttons').appendChild(btn);

  return btn;
}

