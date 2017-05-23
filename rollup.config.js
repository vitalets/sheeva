
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import filesize from 'rollup-plugin-filesize';

export default {
  entry: 'src/index.js',
  dest: 'dist/sheeva.js',
  format: 'umd',
  moduleName: 'Sheeva',
  sourceMap: true,
  plugins: [
    resolve({jsnext: true, main: true}),
    commonjs(),
    globals(),
    builtins(),
    filesize(),
  ]
};

