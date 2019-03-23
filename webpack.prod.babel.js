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
  output: {
    filename: 'ml5.min.js',
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
    }),
  ],
});
