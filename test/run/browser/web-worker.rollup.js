
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const globals = require('rollup-plugin-node-globals');
const string = require('rollup-plugin-string');

module.exports = {
  entry: 'test/run/browser/web-worker.js',
  dest: 'dist/test/web-worker.js',
  format: 'iife',
  moduleName: 'webWorker',
  sourceMap: true,
  useStrict: false,
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

