
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import string from 'rollup-plugin-string';

export default {
  entry: 'test/run/browser/sheeva.config.js',
  dest: 'dist/test/sheeva-config.js',
  format: 'iife',
  moduleName: 'sheevaConfig',
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

