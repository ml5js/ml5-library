// Copyright (c) 2019 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { existsSync, mkdirSync, writeFileSync, lstatSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import merge from 'webpack-merge';
import common from './webpack.common.babel';

// this is the function to initialize manual-test folder when running `npm run start`
(function checkExperimentsFolder() {
  const experimentsDir = join(__dirname, './manual-test');
  const indexFile = join(experimentsDir, './index.html');

  // create manual-test dir if not exist, or check if it is a readable dir.
  if (!existsSync(experimentsDir)) mkdirSync(experimentsDir);
  else {
    assert(lstatSync(experimentsDir).isDirectory(), "./manual-test should be a readable folder.");
  }

  // create index.html in manual-test dir if not exist, or check if it is a readable file.
  if (!existsSync(indexFile)) {
    writeFileSync(indexFile, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ml5.js manual test</title>
        <script src="http://localhost:8080/ml5.js"></script>
      </head>
      <body>
        <script>
          // Your scripts would be written here
        </script>
      </body>
      </html>`.replace(/      /g, '').trimLeft());
  } else {
    assert(lstatSync(indexFile).isFile(), "./manual-test/index.html should be a readable file.");
  }

})();

export default merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    watchContentBase: true,
    contentBase: [join(__dirname, './dist'), join(__dirname, './manual-test')]
  },
  plugins: []
});