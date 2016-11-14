const path = require('path');
const expect = require('unexpected');
const Sheeva = require('../src');

// globals
global.expect = expect;
global.noop = function () {};
global.mocks = new Map();
global.run = runSheeva;

function runSheeva(file, env) {
  clearRequireCache(file);
  const sheeva = new Sheeva({
    reporters: require('./log-reporter'),
    files: file,
    createEnvs: function () {
      return [
        env,
      ];
    },
    createWrapFn: createWrapFn,
  });
  return sheeva.run()
    .then(() => sheeva.getReporter(0).getLog(env));
}

function clearRequireCache(file) {
  const absPath = path.resolve(file);
  delete require.cache[absPath];
}

function createWrapFn({env, fn, test, hookType, suite, hookIndex}) {
  const name = test
    ? test.name
    : `${suite.parent ? suite.name + ' ' : ''}${hookType} ${hookIndex}`;
  if (mocks.has(name)) {
    fn = mocks.get(name);
    mocks.delete(name);
  }
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
