/**
 * Main selftest runner
 */

require('./globals');
const SubSheeva = require('./sub-sheeva');
const ConsoleReporter = require('sheeva-reporter-console');

const append = process.env.TRAVIS || process.env.SHEEVA_APPEND;

module.exports = {
  files: './test/specs',
  concurrency: 5,
  reporters: new ConsoleReporter({append}),
  newSessionPerFile: false,
  splitSuites: true,
  createEnvs: function () {
    return [
      {id: 'sync-env'},
      {id: 'async-env', delay: 10},
      //{id: 'async-env1', delay: 40},
      //{id: 'async-env2', delay: 50},
    ];
  },
  startRunner: function (config) {
    config.envs.forEach(env => env.delay ? createSubConfig(env) : null);
  },
  callTestHookFn: function ({fn, session, context, hook, env}) {
    if (hook) {
      context.runOptions = context.runOptions || {};
      return fn(context);
    }

    const run = function (code, options = {}) {
      const configFromHooks = context.runOptions && context.runOptions.config;
      const configFromTest = options.config;
      options.config = Object.assign({}, env.subConfig, configFromHooks, configFromTest);
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
        : callAsync(env.delay, params);
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
    }, delay);
  });
}
