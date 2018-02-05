import { join } from 'path';

const include = join(__dirname, 'src');

export default {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: join(__dirname, 'dist'),
    libraryTarget: 'umd',
    publicPath: '/dist/',
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
  },
};
