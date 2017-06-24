'use strict';

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const CompressionPlugin = require("compression-webpack-plugin");

const outputPath = path.join(path.resolve('dist'), 'test-web-workers');

const masterConfig = {
  entry: __dirname,
  output: {
    filename: 'index.js',
    path: outputPath,
  },
  target: 'web',
  devtool: 'source-map',
  resolve: {
    extensions: ['.browser.js', '.js', '.json']
  },
  plugins: [
    new CleanWebpackPlugin([outputPath], {root: path.resolve('.')}),
    new HtmlWebpackPlugin({title: 'Sheeva self-tests (web workers)'}),
    // new CompressionPlugin({
    //   asset: "[path].gz[query]",
    //   algorithm: "gzip",
    //   test: /\.(js|html)$/,
    // }),
    new CopyWebpackPlugin([
      {from: 'test/data', to: 'data'},
    ]),
  ]
};

const workerConfig = {
  entry: path.resolve(__dirname, 'worker.js'),
  output: {
    filename: 'worker.js',
    path: outputPath,
  },
  target: 'webworker',
  devtool: 'source-map',
  resolve: {
    extensions: ['.browser.js', '.js', '.json']
  },
  plugins: [
    // new CompressionPlugin({
    //   asset: "[path].gz[query]",
    //   algorithm: "gzip",
    //   test: /\.(js|html)$/,
    // }),
  ]
};

module.exports = [masterConfig, workerConfig];
