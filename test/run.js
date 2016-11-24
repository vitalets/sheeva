/**
 * Main selftest runner
 */

require('./sub-run');
const ProgressReporter = require('sheeva-reporter-progress');
const Sheeva = require('../src');

const config = {
  concurrency: 19,
  files: './test/specs/*.test.js',
  //files: './test/specs/only.test.js',
  splitSuites: true,
  reporters: ProgressReporter,
  timings: false,
  createEnvs: function () {
    return [
      //{id: 'tests-sync'},
      {id: 'tests-async', delay: 40},
      {id: 'tests-sync'},
      //{id: 'tests-async2', delay: 40},
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
  createWrapFn: function ({fn, session}) {
    return function () {
      return fn(session);
    };
  }
};

new Sheeva(config).run()
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
