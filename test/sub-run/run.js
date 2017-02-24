/**
 * Exports run() function passed to all tests
 */

const path = require('path');
require('promise.prototype.finally').shim();
const baseConfig = require('./sheeva.config');
const TempFiles = require('./tempfiles');

/**
 * Runs specified code with tests
 *
 * @param {String|Array} code
 * @param {Object} options
 * @param {Object} options.session
 * @param {Object} [options.config]
 * @param {Array} [options.include]
 * @param {Array} [options.exclude]
 * @returns {Promise}
 */
module.exports = function (code, options) {
  const tempFiles = new TempFiles(code, options.session);
  const config = Object.assign({}, baseConfig, options.config, {files: tempFiles.files});
  const Sheeva = requireSheeva();
  const sheeva = new Sheeva(config);
  return sheeva.run()
    .then(() => sheeva.getReporter(0).getResult(options))
    .catch(error => attachReportToError(error, sheeva, options))
    .finally(() => tempFiles.cleanup());
};

function attachReportToError(error, sheeva, options) {
  try {
    Object.defineProperty(error, 'report', {
      value: sheeva.getReporter(0).getResult(options)
    });
  } catch (err) {
    // reporter may not exist
  }
  return Promise.reject(error);
}

/**
 * Clear src cache to have fresh instance of Sheeva for testing
 */
function requireSheeva() {
  clearSrcCache();
  return require('../../src');
}

function clearSrcCache() {
  Object.keys(require.cache).forEach(key => {
    const relpath = path.relative('.', key);
    if (relpath.startsWith('src/')) {
      delete require.cache[key];
    }
  });
}
