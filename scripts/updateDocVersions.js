/**
 * USAGE
 * run:
 *```
 *$ oldversion=0.4.2 npm run update:docs
 *```
 */

const fs = require('fs');


// ------------------
//  Helper functions
// ------------------
function readTextFile(fpath){
  const readme = fs.readFileSync(fpath, 'utf8');
  return readme;
}

function readPackageJson(fpath){
  let output = fs.readFileSync(fpath);
  output = JSON.parse(output);
  return output;
}

function updateFileVersion(inputFilePath, regex, newUrl){
  const readme = readTextFile(inputFilePath);
  const updatedReadme = readme.replace(regex, newUrl) 
  fs.writeFileSync(inputFilePath, updatedReadme);
}

const oldVersion = process.env.oldversion;
const ml5Version = readPackageJson('./package.json').version || 'latest';
const newUrl = `https://unpkg.com/ml5@${ml5Version}/dist/ml5.min.js`;
const regex = new RegExp(`https://unpkg.com/ml5@${oldVersion}/dist/ml5.min.js`, "g");


function make(){
  if(!oldVersion) {
    console.log("!!!old version needed!!! \n  oldversion=0.4.X npm run update:docs");
    process.exit(1);
  }

  updateFileVersion('./docs/README.md', regex, newUrl);
  updateFileVersion('./docs/tutorials/hello-ml5.md', regex, newUrl);
  
  console.log(`updated docs from version ${oldVersion} to ${ml5Version}`)
}
make();





