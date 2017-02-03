/**
 * Exports run() function passed to all tests
 */

const Sheeva = require('../../src');
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
  const sheeva = new Sheeva(config);
  return sheeva.run()
    .then(() => sheeva.getReporter(0).getResult(options))
    .then(res => {
      tempFiles.cleanup();
      return res;
    }, e => {
      tempFiles.cleanup();
      addReportToError(e, sheeva, options);
      return Promise.reject(e);
    });
};

function addReportToError(e, sheeva, options) {
  try {
    Object.defineProperty(e, 'report', {
      value: sheeva.getReporter(0).getResult(options)
    });
  } catch (err) {
    // reporter may not exist
  }
}
