/**
 * Main selftest runner
 */

require('./setup');
const Sheeva = require('../src');

const config = {
  // concurrency: 2,
  files: './test/specs/*.test.js',
  //files: './test/specs/only.test.js',
  createEnvs: function () {
    return [
     // {id: 'tests-sync'},
      {id: 'tests-async', delay: 10},
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


