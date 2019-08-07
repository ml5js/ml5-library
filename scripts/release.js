/**
 * Usage:
 * terminal:
 * version=0.3.2 npm run release
 */
const fs = require('fs');
const newVersionNumber = process.env.version;
let oldVersionNumber;

let packageJson = fs.readFileSync('./package.json');
packageJson = JSON.parse(packageJson);

oldVersionNumber = packageJson.version.slice(0,);

let readme = fs.readFileSync('./README.md', 'utf8');




if(newVersionNumber === undefined){
    console.log('version number required!')
    process.exit(22);
}

function updatePackageNumber(){
    console.log(`setting version number from: ${oldVersionNumber} ==> to: ${newVersionNumber}`)
    packageJson.version = newVersionNumber;
    
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
}


function updateReadme(){
    let newReadme = readme.slice(0,);

    const newVersionString = `

<p id="latest-version">

* You can use the latest version (${newVersionNumber}) by adding it to the head section of your HTML document:

**v${newVersionNumber}**

    <script src="https://unpkg.com/ml5@${newVersionNumber}/dist/ml5.min.js" type="text/javascript"></script>

</p>
    `

    const legacyVersionString = `

<p id="legacy-versions">

**v${oldVersionNumber}**

    <script src="https://unpkg.com/ml5@${oldVersionNumber}/dist/ml5.min.js" type="text/javascript"></script>
    `

    // add the new latest version in
    newReadme = newReadme.replace(/<p id="latest-version">([\s\S]*)<\/p data-id="latest-version">/g, newVersionString);
    // add the last version to the legacy section
    newReadme = newReadme.replace(/<p id="legacy-versions">/g, legacyVersionString);

    fs.writeFileSync('./README.md', newReadme);
}

updatePackageNumber()
updateReadme()


console.log('finished!')

