'use strict';

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = path.join(path.resolve('dist'), 'test-web-workers');

module.exports = {
  entry: {
    index: __dirname,
    worker: path.join(__dirname, 'worker')
  },
  output: {
    filename: '[name].js',
    path: outputPath
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.browser.js', '.js', '.json']
  },
  plugins: [
    new CleanWebpackPlugin([outputPath], {root: path.resolve('.')}),
    new HtmlWebpackPlugin({
      chunks: ['index'],
      title: 'Sheeva self-tests (web workers)'
    }),
    new CopyWebpackPlugin([
      {from: 'test/data', to: 'data'},
    ]),
  ]
};
