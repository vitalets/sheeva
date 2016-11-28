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
    .then(res => cleanUp(tempFiles, res), e => cleanUp(tempFiles, Promise.reject(e)))
}

function createConfig(options) {
  return Object.assign({}, {
    concurrency: 1,
    reporters: require('./log-reporter'),
    splitSuites: false,
    createEnvs: function () {
      return [{id: 'env1'}];
    },
    //timings: './sheeva.timings.json',
  }, options.session.data, options.config);
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

function cleanUp(tempFiles, res) {
  tempFiles.forEach(fs.unlinkSync);
  return res;
}

function clearRequireCache(file) {
  const absPath = path.resolve(file);
  delete require.cache[absPath];
}
