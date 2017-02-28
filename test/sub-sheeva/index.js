/**
 * Runs specified code in fresh instance of Sheeva
 */

const path = require('path');
require('promise.prototype.finally').shim();
const TempFiles = require('./tempfiles');
const Reporter = require('./reporter');

const BASE_CONFIG = {
  concurrency: 1,
  splitFiles: false,
  createEnvs: function () {
    return [{id: 'env1'}];
  },
};
const SHEEVA_PATH = '../../src/';

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
   * @returns {Promise}
   */
  constructor(code, options) {
    this._tempFiles = new TempFiles(code, options.session);
    this._reporter = new Reporter(options);
    this._config = this._createConfig(options.config);
    this._sheeva = null;
  }

  run() {
    this._sheeva = this._createSheeva();
    return this._sheeva.run()
      .then(() => this._reporter.getResult())
      .catch(e => this._attachReportToError(e))
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

  _attachReportToError(error) {
    Object.defineProperty(error, 'report', { value: this._reporter.getResult() });
    return Promise.reject(error);
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


