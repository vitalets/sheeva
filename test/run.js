/**
 * Main selftest runner
 */

require('./sub-run');
const Sheeva = require('../src');

const config = {
  concurrency: 5,
  files: './test/specs/*.test.js',
  //files: './test/specs/only.test.js',
  //splitSuites: false,
  splitSuites: true,
  reporters: require('sheeva-reporter-progress'),
  //reporters: require('./debug-reporter'),
  createEnvs: function () {
    return [
      {id: 'tests-sync'},
      {id: 'tests-async', delay: 10},
     // {id: 'tests-async1', delay: 10},
      //{id: 'tests-async2', delay: 30},
      //{id: 'tests-async3', delay: 50},
      //{id: 'tests-sync'},
      //{id: 'tests-async4', delay: 100},
    ];
  },
  // session data actually contains sub-run config overwrites
  createSessionData: function (env) {
    return {
      callTestHookFn: env.delay === undefined ? callSync : callAsync.bind(null, env.delay)
    };
  },
  callTestHookFn: function ({fn, session, context, hookType}) {
    if (hookType) {
      return fn(context);
    }
    const run = function (code, options) {
      return global.runCode(code, Object.assign({session}, context, options));
    };
    return fn(run);
  },
  // just for debug:
  // this._options.config._main && console.log(123);
  _main: true,
};

new Sheeva(config).run();

function callSync({fn}) {
  return fn();
}

function callAsync(delay, {fn}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        fn();
        resolve();
      } catch(e) {
        reject(e);
      }
    }, delay)
  });
}
