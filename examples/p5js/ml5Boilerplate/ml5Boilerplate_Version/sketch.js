// Your code will go here

// Open up your console - if everything loaded properly you should see the version number 
// corresponding to the latest version of ml5 printed to the console and in the p5.js canvas.
console.log('ml5 version:', ml5.version);

function setup(){
	createCanvas(400, 400);
	textSize(width / 3);
	textAlign(CENTER, CENTER);
}

function draw(){
	background(200);
	text(ml5.version, width/2, height/2);
}
