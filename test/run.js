/**
 * Main selftest runner
 */

require('./sub-run');
const ProgressReporter = require('sheeva-reporter-progress');
const Sheeva = require('../src');

const config = {
  concurrency: 2,
  files: './test/specs/*.test.js',
  //files: './test/specs/only.test.js',
  reporters: ProgressReporter,
  timings: false,
  createEnvs: function () {
    return [
      {id: 'tests-sync'},
      {id: 'tests-async', delay: 10},
      //{id: 'tests-async2', delay: 40},
    ];
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

function isAssertionError(error) {
  return error.name === 'UnexpectedError';
}

