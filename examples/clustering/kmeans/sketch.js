// Daniel Shiffman
// In Progress k-means clustering example


// Centroid object
class Centroid {
  constructor(label, members) {
    this.label = label; // Label
    this.members = [];  // Closest vectors
    this.names = [];    // Names of closest vectors, redundant?
    this.vector = [];   // Vector
  }

  addMember(key, v) {
    this.members.push(v);
    this.names.push(key);
  }

  clearMembers() {
    this.members = [];
    this.names = [];
  }
}

function setup() {
  noCanvas();

  let names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  let data = {};
  for (let i = 0; i < names.length; i++) {
    let key = names[i];
    let vector = new Array(100);
    for (let j = 0; j < vector.length; j++) {
      vector[j] = random(1);
    }
    data[key] = vector;
  }

  let centroids = kmeans(data, 4, 100);
  console.log(data);
  for (let i = 0; i < centroids.length; i++) {
    createElement('h3', i);
    for (let j = 0; j < centroids[i].names.length; j++) {
      createSpan(centroids[i].names[j]);
      createSpan(' ');
    }
  }

}

function sameCentroids(prev, current) {
  if (prev.length === 0 || current.length === 0) return false;

  let same = true;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== current[i] || current[i] === 0) {
      same = false;
    }
  }
  // console.log(same);
  return same;
}



// Implementing kmeans
function kmeans(vectors, k, maxiterations) {

  let keys = Object.keys(vectors);

  // Initialize random centroids
  let n = vectors[keys[0]].length;
  console.log(n);
  // Random Centroids
  let centroids = [];
  for (let i = 0; i < k; i++) {
    let centroid = new Centroid(i);
    for (let j = 0; j < n; j++) {
      centroid.vector[j] = random(1);
    }
    centroids[i] = centroid;
  }

  let iterations = 0
  let previous = [];
  let current = [];

  // Run the main k-means algorithm
  while (!sameCentroids(previous, current) && iterations < maxiterations) {
    console.log(iterations);

    for (let i = 0; i < centroids.length; i++) {
      previous[i] = centroids[i].members.length;
    }

    for (let i = 0; i < centroids.length; i++) {
      centroids[i].clearMembers();
    }

    // For each element in the dataset, chose the closest centroid.
    // Make that centroid the element's label.
    for (let i = 0; i < keys.length; i++) {
      let v = vectors[keys[i]];
      let centroid = findClosest(v, centroids);
      centroid.addMember(keys[i], v);
      v.label = centroid.label;
    }

    console.log(centroids);
    for (let i = 0; i < centroids.length; i++) {
      current[i] = centroids[i].members.length;
    }


    // Each centroid is the geometric mean of the points that
    for (let i = 0; i < centroids.length; i++) {
      // Create vector of 0s
      let newV = new Array(n);
      newV.fill(0);

      // Average all members
      let members = centroids[i].members;
      if (members.length === 0) {
        newV = newV.map(x => random(1));
      } else {
        for (let j = 0; j < members.length; j++) {
          let v = members[j]
          for (let k = 0; k < v.length; k++) {
            newV[k] += v[k];
          }
        }
        // Average all the elements
        newV = newV.map(x => x / members.length);
      }
    }
    iterations++;
  }

  return centroids;

}


function magnitude(a) {
  let sum = a.reduce((sum, val) => {
    return sum + val * val;
  }, 0);
  return Math.sqrt(sum);
}


// Cosine similarity!
function distance(v1, v2) {
  let sum = v1.reduce((sum, a, i) => {
    return sum + a * v2[i];
  }, 0);
  // Distance is the inverse of cosine similarity!
  return 1 - (sum / (magnitude(v1) * magnitude(v2)));
}


function findClosest(v, centroids) {
  let closest = 0;
  let recordD = distance(v, centroids[0].vector);
  for (let i = 1; i < centroids.length; i++) {
    let d = distance(v, centroids[i].vector);
    if (d < recordD) {
      recordD = d;
      closest = i;
    }
  }
  return centroids[closest];
}
