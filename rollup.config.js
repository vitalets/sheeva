
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const filesize = require('rollup-plugin-filesize');

module.exports = {
  entry: `${process.env.SHEEVA_DIR || 'src'}/index.js`,
  dest: 'dist/sheeva.js',
  format: 'umd',
  moduleName: 'Sheeva',
  sourceMap: true,
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false,
      extensions: ['.browser.js', '.js']
    }),
    commonjs(),
    filesize(),
  ]
};

