import { join } from 'path';

const include = join(__dirname, 'src');

export default {
  entry: './src/index.js',
  output: {
    path: join(__dirname, 'dist'),
    libraryTarget: 'umd',
    publicPath: "/dist/",
    filename: "highml.js",
    library: 'highml'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', include },
      { test: /\.json$/, loader: 'json', include }
    ],
  }
}
