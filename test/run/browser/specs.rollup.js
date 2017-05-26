
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import multiEntry from 'rollup-plugin-multi-entry';

export default {
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
