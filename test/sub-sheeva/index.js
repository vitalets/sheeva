/**
 * Runs specified code in fresh instance of Sheeva
 */

const path = require('path');
require('promise.prototype.finally').shim();
const TempFiles = require('./tempfiles');
const Reporter = require('./reporter');

const SHEEVA_PATH = `../../${process.env.SHEEVA_DIR || 'src'}/`;
const BASE_CONFIG = {
  concurrency: 1,
  splitSuites: false,
  createEnvs: function () {
    return [{id: 'env1'}];
  },
};

module.exports = class SubSheeva {
  /**
   * Constructor
   *
   * @param {String|Array} code
   * @param {Object} options
   * @param {Object} options.session
   * @param {Object} [options.config]
   * @param {Array} [options.include]
   * @param {Array} [options.exclude]
   * @param {Boolean} [options.flat]
   * @param {Boolean} [options.raw]
   * @param {Boolean} [options.result]
   * @returns {Promise}
   */
  constructor(code, options) {
    this._options = options;
    this._tempFiles = new TempFiles(code, options.session);
    this._reporter = new Reporter(options);
    this._config = this._createConfig(options.config);
    this._sheeva = null;
  }

  run() {
    this._sheeva = this._createSheeva();
    let output = null;
    return this._sheeva.run()
      .then(result => output = this._options.result ? result : this._reporter.getReport())
      .catch(e => {
        return this._options.result
          ? attachToError(e,  'result', output)
          : attachToError(e,  'report', output || this._reporter.getReport());
      })
      .finally(() => this._tempFiles.cleanup());
  }

  _createConfig(config) {
    return Object.assign({}, BASE_CONFIG, config, {
      files: this._tempFiles.files,
      reporters: this._reporter,
    });
  }

  /**
   * Clear src cache to have fresh instance of Sheeva for concurrent testing
   */
  _createSheeva() {
    this._clearRequireCache();
    const Sheeva = require(SHEEVA_PATH);
    return new Sheeva(this._config);
  }

  _clearRequireCache() {
    Object.keys(require.cache).forEach(key => {
      const relpath = path.relative(__dirname, key);
      if (relpath.startsWith(SHEEVA_PATH)) {
        delete require.cache[key];
      }
    });
  }
};

function attachToError(error, key, value) {
  Object.defineProperty(error, key, {value});
  return Promise.reject(error);
}
