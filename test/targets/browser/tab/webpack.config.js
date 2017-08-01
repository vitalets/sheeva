'use strict';

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = path.join(path.resolve('dist'), 'test-tab');

module.exports = {
  entry: __dirname,
  output: {
    filename: 'index.js',
    path: outputPath
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.browser.js', '.js', '.json']
  },
  plugins: [
    new CleanWebpackPlugin([outputPath], {root: path.resolve('.')}),
    new HtmlWebpackPlugin({title: 'Sheeva self-tests (tab)'}),
    new CopyWebpackPlugin([
      {from: 'test/data', to: 'data'},
    ]),
  ]
};
