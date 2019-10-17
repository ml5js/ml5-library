const fs = require('fs');
const newVersionNumber = process.env.newversion;

function checkVersionGiven(){
    if(newVersionNumber === undefined){
        console.log('🔥🔥🔥submit the new version number 🔥🔥🔥');
        process.exit(22);    
    }   
}

function updatePackageVersion(fpath){
    checkVersionGiven();
    let packageJson = fs.readFileSync(fpath);
    packageJson = JSON.parse(packageJson);
    packageJson.version = newVersionNumber;


    fs.writeFileSync(fpath, JSON.stringify(packageJson, null, 2));

}
updatePackageVersion('./package.json')

// module.exports = updatePackageVersion;