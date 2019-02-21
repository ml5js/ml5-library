// Copyright (c) 2018 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { existsSync } from 'fs';
import { join } from 'path';
import merge from 'webpack-merge';
import common from './webpack.common.babel';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    watchContentBase: true,
    contentBase: [join(__dirname, './dist'), join(__dirname, './experiments')]
  },
  plugins: existsSync(join(__dirname, './experiments/index.html')) ? [] : [
    new HtmlWebpackPlugin({
      title: 'ml5'
    })
  ]
})
