
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';

export default {
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

