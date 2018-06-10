// Copyright (c) 2018 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { join, resolve } from 'path';

const include = join(__dirname, 'src');

export default {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: resolve(__dirname, 'dist'),
    publicPath: '/',
    libraryTarget: 'umd',
    filename: 'ml5.js',
    library: 'ml5',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include,
      },
    ],
  }
};
