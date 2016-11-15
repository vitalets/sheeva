/**
 * Main selftest runner
 */

require('./sub-run');
const Sheeva = require('../src');

const config = {
  concurrency: 2,
  files: './test/specs/*.test.js',
  //files: './test/specs/only.test.js',
  createEnvs: function () {
    return [
      {id: 'tests-sync'},
      {id: 'tests-async', delay: 30},
      //{id: 'tests-async2', delay: 40},
    ];
  },
  createEnvLabel: function (env) {
    return env.id;
  },
  createWrapFn: function ({fn, env}) {
    return function () {
      return fn(env);
    };
  }
};

new Sheeva(config).run();
