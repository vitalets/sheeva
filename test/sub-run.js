const path = require('path');
const expect = require('unexpected');
const fs = require('fs');
const Sheeva = require('../src');

// globals
global.expect = expect;
global.noop = function () {};
global.runCode = runCode;

/**
 *
 * @param {String} code
 * @param {Object} options
 * @param {Object} options.session
 * @param {Object} [options.config]
 * @param {Object} [logFilter]
 * @returns {Promise}
 */
function runCode(code, options, logFilter = []) {
  const tempFile = createTempFile(code, options.session);
  const config = createConfig(options);
  config.files = tempFile;
  const sheeva = new Sheeva(config);
  return sheeva.run()
    .then(() => sheeva.getReporter(0).getLog(logFilter))
    .then(res => cleanUp(tempFile, res), e => cleanUp(tempFile, Promise.reject(e)))
}

function createConfig(options) {
  return Object.assign({}, {
    concurrency: 1,
    reporters: require('./log-reporter'),
    suiteSplit: false,
    //timings: './sheeva.timings.json',
  }, options.session.data, options.config);
}

function createTempFile(code, session) {
  const tempFile = `./test/temp-${session.index}.js`;
  fs.writeFileSync(tempFile, code);
  clearRequireCache(tempFile);
  return tempFile;
}

function cleanUp(tempFile, res) {
  fs.unlinkSync(tempFile);
  return res;
}

function clearRequireCache(file) {
  const absPath = path.resolve(file);
  delete require.cache[absPath];
}
