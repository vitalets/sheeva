const path = require('path');
const expect = require('unexpected');
const Sheeva = require('../src');

// globals
global.expect = expect;
global.noop = function () {};
global.run = runSheeva;

function runSheeva(file, env, mocks = {}) {
  clearRequireCache(file);
  const sheeva = new Sheeva({
    reporters: require('./log-reporter'),
    files: file,
    timings: './sheeva.timings.json',
    createEnvs: function () {
      return [
        env,
      ];
    },
    createWrapFn: createWrapFn.bind(null, mocks),
  });
  return sheeva.run()
    .then(() => sheeva.getReporter(0).getLog(env));
}

function clearRequireCache(file) {
  const absPath = path.resolve(file);
  delete require.cache[absPath];
}

function createWrapFn(mocks, {env, fn, test, hookType, suite, hookIndex}) {
  const name = test
    ? test.name
    : `${suite.parent ? suite.name + ' ' : ''}${hookType} ${hookIndex}`;
  if (mocks && mocks[name]) {
    fn = mocks[name];
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
