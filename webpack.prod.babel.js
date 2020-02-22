// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import merge from 'webpack-merge';
import common from './webpack.common.babel';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

export default merge(common, {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    ml5: ["babel-polyfill", "./src/index.js"],
    "ml5.min": ["babel-polyfill", "./src/index.js"],
  },
  output: {
    filename: "[name].js",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJSPlugin({
        include: /\.min\.js$/,
        sourceMap: true,
      }),
    ],
  },
});
