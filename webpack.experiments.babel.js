// Copyright (c) 2019 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { existsSync, mkdirSync, writeFileSync, lstatSync } from 'fs';
import { join } from 'path';
import merge from 'webpack-merge';
import common from './webpack.common.babel';

// this is the function to initialize experiments folder when running `npm run start`
(function checkExperimentsFolder() {
  const experimentsDir = join(__dirname, './experiments');
  const indexFile = join(experimentsDir, './index.html');

  // create experiments dir if not exist, or check if it is a readable dir.
  if (!existsSync(experimentsDir)) mkdirSync(experimentsDir);
  else {
    assert(lstatSync(experimentsDir).isDirectory(), "./experiments should be a readable folder.");
  }

  // create index.html in experiments dir if not exist, or check if it is a readable file.
  if (!existsSync(indexFile)) {
    writeFileSync(indexFile, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ml5.js experiments</title>
        <script src="http://localhost:8080/ml5.js"></script>
      </head>
      <body>
        <script>
          // Your scripts would be written here
        </script>
      </body>
      </html>`.replace(/      /g, '').trimLeft());
  } else {
    assert(lstatSync(indexFile).isFile(), "./experiments/index.html should be a readable file.");
  }

})();

export default merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    watchContentBase: true,
    contentBase: [join(__dirname, './dist'), join(__dirname, './experiments')]
  },
  plugins: []
});