const path = require('path');
const expect = require('unexpected');
const fs = require('fs');
const Sheeva = require('../src');

// globals
global.expect = expect;
global.noop = function () {};
global.runFile = runFile;
global.runCode = runCode;

function runFile(file, session, filter) {
  clearRequireCache(file);
  const sheeva = new Sheeva({
    reporters: require('./log-reporter'),
    files: file,
    suiteSplit: false,
    //timings: './sheeva.timings.json',
    createEnvs: function () {
      return [
        session.env,
      ];
    },
    createWrapFn: createWrapFn,
  });
  return sheeva.run()
    .then(() => sheeva.getReporter(0).getLog(session.env, filter));
}

function runCode(code, session, filter) {
  const tempFile = `./test/temp-${session.index}.js`;
  fs.writeFileSync(tempFile, code);
  return runFile(tempFile, session, filter)
    .then(
      res => {
        fs.unlinkSync(tempFile);
        return res;
      },
      e => {
        fs.unlinkSync(tempFile);
        return Promise.reject(e);
      }
    )
}

function clearRequireCache(file) {
  const absPath = path.resolve(file);
  delete require.cache[absPath];
}

function createWrapFn({env, fn}) {
  // const name = test ? test.name : getHookName(suite, hookType, hookIndex);
  return function () {
    if (env.id === 'tests-sync') {
      return fn();
    } else {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            fn();
            resolve();
          } catch(e) {
            reject(e);
          }
        }, env.delay)
      })
    }
  };
}

function getHookName(suite, hookType, hookIndex) {
  return `${suite.parent ? suite.name + ' ' : ''}${hookType} ${hookIndex}`;
}
