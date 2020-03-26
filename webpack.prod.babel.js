// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import merge from 'webpack-merge';
import common, {indexEntryWithBabel} from './webpack.common.babel';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

export default merge(common, {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    ml5: indexEntryWithBabel,
    "ml5.min": indexEntryWithBabel,
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
