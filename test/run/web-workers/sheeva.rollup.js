'use strict';

const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const globals = require('rollup-plugin-node-globals');
const string = require('rollup-plugin-string');
const unexpectedPath = path.resolve('./node_modules/unexpected/unexpected.js');

module.exports = {
  entry: 'test/run/browser/sheeva.config.js',
  dest: 'dist/test/sheeva-config.js',
  format: 'iife',
  moduleName: 'sheevaConfig',
  sourceMap: true,
  // use pre-built version of unexpected as it does not work when build with `useStrict`.
  external: [
    unexpectedPath,
  ],
  globals: {
    [unexpectedPath]: 'weknowhow.expect',
  },
  plugins: [
    string({
      include: 'dist/sheeva.js'
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false,
      extensions: ['.browser.js', '.js']
    }),
    commonjs(),
    globals(),
  ]
};

