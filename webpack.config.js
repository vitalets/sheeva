'use strict';

const path = require('path');

module.exports = {
  entry: './src',
  output: {
    filename: 'sheeva.js',
    path: path.resolve('dist'),
    library: 'Sheeva',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.browser.js', '.js', '.json']
  }
};
