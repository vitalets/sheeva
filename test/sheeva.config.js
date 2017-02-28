/**
 * Main selftest runner
 */

require('./globals');
const SubSheeva = require('./sub-sheeva');

module.exports = {
  concurrency: 5,
  files: './test/specs/**/*.test.js',
  newSessionPerFile: false,
  splitFiles: true,
  reporters: require('sheeva-reporter-progress'),
  createEnvs: function () {
    return [
      {id: 'sync-env'},
      {id: 'async-env', delay: 10},
    ];
  },
  startRunner: function(config) {
    config.envs.forEach(env => env.delay ? createSubConfig(env) : null);
  },
  callTestHookFn: function ({fn, session, context, hook, env}) {
    if (hook) {
      context.runOptions = context.runOptions || {};
      return fn(context);
    }

    const run = function (code, options = {}) {
      options.config = Object.assign({}, env.subConfig, options.config);
      const finalOptions = Object.assign({session}, context.runOptions, options);
      return new SubSheeva(code, finalOptions).run();
    };
    return fn(run);
  },
};

function createSubConfig(env) {
  env.subConfig = {
    callTestHookFn: function (params) {
      const {fn, session, context, attempt} = params;
      return params !== noop
        ? fn(context, session, attempt)
        : callAsync(env.delay, params)
    }
  };
}

function callAsync(delay, {fn, session, context, attempt}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        fn(context, session, attempt);
        resolve();
      } catch(e) {
        reject(e);
      }
    }, delay)
  });
}
