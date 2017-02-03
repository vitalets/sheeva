const path = require('path');
const expect = require('unexpected');
const fs = require('fs');
const Sheeva = require('../src');

// globals
global.expect = expect;
global.noop = function () {};
global.runCode = runCode;
global.expectResolve = function (promise, value) {
  return value === undefined
    ? expect(promise, 'to be fulfilled')
    : expect(promise, 'to be fulfilled with value exhaustively satisfying', value);
};
global.expectReject = function (promise, value) {
  return value === undefined
    ? expect(promise, 'to be rejected')
    : expect(promise, 'to be rejected with error exhaustively satisfying', value);
};

/**
 *
 * @param {String|Array} code
 * @param {Object} options
 * @param {Object} options.session
 * @param {Object} [options.config]
 * @param {Array} [options.include]
 * @param {Array} [options.exclude]
 * @returns {Promise}
 */
function runCode(code, options) {
  const tempFiles = createTempFiles(code, options.session);
  const config = createConfig(options);
  config.files = tempFiles;
  const sheeva = new Sheeva(config);
  return sheeva.run()
    .then(() => sheeva.getReporter(0).getResult(options))
    .then(res => {
      cleanUp(tempFiles);
      return res;
    }, e => {
      try {
        Object.defineProperty(e, 'report', {
          value: sheeva.getReporter(0).getResult(options)
        });
      } catch (err) { }
      cleanUp(tempFiles);
      return Promise.reject(e);
    });
}

function createConfig(options) {
  return Object.assign({
    concurrency: 1,
    reporters: require('./log-reporter'),
    splitFiles: false,
    createEnvs: function () {
      return [{id: 'env1'}];
    },
  }, options.config);
}

function createTempFiles(code, session) {
  code = Array.isArray(code) ? code : [code];
  const tempFiles = [];
  code.forEach((content, index) => {
    const tempFile = `./test/temp-${session.index}-${index}.js`;
    fs.writeFileSync(tempFile, content);
    clearRequireCache(tempFile);
    tempFiles.push(tempFile);
  });
  return tempFiles;
}

function cleanUp(tempFiles) {
  tempFiles.forEach(fs.unlinkSync);
}

function clearRequireCache(file) {
  const absPath = path.resolve(file);
  delete require.cache[absPath];
}
