const fs = require('fs');
const oldVersionNumber = process.env.pversion;

function checkVersionGiven(){
    if(oldVersionNumber === undefined){
        console.log('🔥🔥🔥submit the previous version number 🔥🔥🔥');
        process.exit(22);    
    }   
}

function getReadme(fpath){
    let readme = fs.readFileSync(fpath, 'utf8');
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

</p>
    `

    return newVersionString;
}

function makeLegacyVersionString(oldVersionNumber){
    const legacyVersionString = `

<p id="legacy-versions">

**v${oldVersionNumber}**

    <script src="https://unpkg.com/ml5@${oldVersionNumber}/dist/ml5.min.js" type="text/javascript"></script>
    `

    return legacyVersionString
}


function make(){
    checkVersionGiven();
    let packageJson = readPackageJson('./package.json');
    const newVersionNumber = packageJson.version;
    
    console.log(`updating version: ${oldVersionNumber} to version: ${newVersionNumber}`);

    const newVersionString = makeNewVersionString(newVersionNumber);
    const legacyVersionString = makeLegacyVersionString(oldVersionNumber);
    
    
    let readme = getReadme('./README.md');
    let newReadme = readme.replace(/<p id="latest-version">([\s\S]*)<\/p data-id="latest-version">/g, newVersionString);
    // add the last version to the legacy section
    newReadme = readme.replace(/<p id="legacy-versions">/g, legacyVersionString);

    fs.writeFileSync('./README.md', newReadme);

}
make();