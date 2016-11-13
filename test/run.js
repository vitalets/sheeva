
const path = require('path');
const expect = require('unexpected');
const Sheeva = require('../src');

global.expect = expect;
global.Sheeva = Sheeva;
global.noop = function () {};
global.mocks = new Map();
global.run = function (file) {
  const sheeva = new Sheeva({
    reporters: require('./log-reporter'),
    files: file,
    createEnvs: function () {
      return [
        {id: 'tests-sync'},
       // {id: 'tests-async', delay: 1000},
      ];
    },
    createWrapFn: function ({env, fn, test, hookType, suite, hookIndex}) {
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
          return new Promise(resolve => {
            setTimeout(() => {
              fn();
              resolve();
            }, env.delay)
          })
        }
      };
    }
  });
  const absPath = path.resolve(file);
  delete require.cache[absPath];
  return sheeva.run()
    .then(() => sheeva.getReporter(0).log);
};

const config = {
  files: './test/specs/*.test.js'
  //files: './test/specs/only.test.js'
};
new Sheeva(config).run();


