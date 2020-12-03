const fs = require('fs');

function getReadme(fpath){

  const readme = fs.readFileSync(fpath, 'utf8');

  return readme;
}

function readPackageJson(fpath){
  let output = fs.readFileSync(fpath);
  output = JSON.parse(output);
  return output;
}

function makeNewVersionString(newVersionNumber){

  const newVersionString = `
<p id="latest-version">

* You can use the latest version (${newVersionNumber}) by adding it to the head section of your HTML document:

**v${newVersionNumber}**

    <script src="https://unpkg.com/ml5@${newVersionNumber}/dist/ml5.min.js" type="text/javascript"></script>

</p data-id="latest-version">
    `

  return newVersionString;
}


function make(){

  const packageJson = readPackageJson('./package.json');
  const newVersionNumber = packageJson.version;
  const newVersionString = makeNewVersionString(newVersionNumber);

  console.log(`---- updating README to version ${newVersionNumber} ----`)
    
  const readme = getReadme('./README.md');
  const newReadme = readme.replace(/<p id="latest-version">([\s\S]*)<\/p data-id="latest-version">/g, newVersionString);

  fs.writeFileSync('./README.md', newReadme);

}
make();