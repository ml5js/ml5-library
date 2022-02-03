/**
 * USAGE:
 * # if using NPM run
 * $ npm run update:packageVersion -- v0.9.4
 *
 * # if using just node
 * $ node updatePackageVersion.js v0.9.4
 */

const fs = require("fs");

const newVersionNumber = process.argv[2];

function checkVersionGiven() {
  if (newVersionNumber === undefined) {
    console.log("🔥🔥🔥submit the new version number 🔥🔥🔥");
    process.exit(22);
  }
}

function updatePackageVersion(fpath) {
  checkVersionGiven();
  let packageJson = fs.readFileSync(fpath);
  packageJson = JSON.parse(packageJson);
  packageJson.version = newVersionNumber.replace(/v/g, "");

  fs.writeFileSync(fpath, JSON.stringify(packageJson, null, 2));
}
updatePackageVersion("./package.json");

module.exports = updatePackageVersion;
