/**
 * Main selftest runner
 */

require('./sub-run');
const ProgressReporter = require('sheeva-reporter-progress');
const Sheeva = require('../src');

const config = {
  concurrency: 5,
  files: './test/specs/*.test.js',
  //files: './test/specs/only.test.js',
  splitSuites: false,
  reporters: ProgressReporter,
  //reporters: require('./debug-reporter'),
  createEnvs: function () {
    return [
      //{id: 'tests-sync'},
      {id: 'tests-async', delay: 10},
     // {id: 'tests-async2', delay: 40},
    ];
  },
  // session data actually contains sub-run config overwrites
  createSessionData: function (env) {
    return {
      createWrapFn: env.delay === undefined
        ? createSyncFn
        : createAsyncFn.bind(null, env.delay)
    };
  },
  createWrapFn: function ({fn, session, context, hookType}) {
    if (hookType) {
      return function () {
        return fn(context);
      };
    }
    const run = function (code, options) {
      return global.runCode(code, Object.assign({session}, context, options));
    };
    return function () {
      return fn(run);
    };
  },
  // just for debug:
  // this._options.config._main && console.log(123);
  _main: true,
};

const sheeva = new Sheeva(config);
sheeva.run()
  //.then(() => sheeva.getReporter(0).getLog ? console.log(sheeva.getReporter(0).getLog()) : '')
  .catch(e => {
    console.log('Sheeva error!');
    console.log(e);
    process.exit(1);
  });

function createSyncFn({fn}) {
  return fn;
}

function createAsyncFn(delay, {fn}) {
  return function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          fn();
          resolve();
        } catch(e) {
          reject(e);
        }
      }, delay)
    })
  };
}
