
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const multiEntry = require('rollup-plugin-multi-entry');

module.exports = {
  entry: 'test/specs/**/*.js',
  dest: 'dist/test/specs.bundle.js',
  format: 'iife',
  sourceMap: true,
  plugins: [
    resolve({
      jsnext: true,
      main: true,
    }),
    commonjs(),
    multiEntry({exports: false}),
  ]
};
