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
  createTargets: function () {
    const targets = [
      {id: 'sync-target'},
      {id: 'async-target', delay: 10},
    ];
    return targets.map(addConfig);
  },
  callTestHookFn: function ({fn, session, context, hook, target}) {
    if (hook) {
      context.runOptions = context.runOptions || {};
      return fn(context);
    }

    const run = function (code, options = {}) {
      const configFromHooks = context.runOptions && context.runOptions.config;
      const configFromTest = options.config;
      const configFromTarget = target.config;
      options.config = Object.assign({}, configFromTarget, configFromHooks, configFromTest);
      const subSheevaOptions = Object.assign({session}, context.runOptions, options);
      return new SubSheeva(code, subSheevaOptions).run();
    };
    return fn(run);
  },
};

function addConfig(target) {
  target.config = {
    callTestHookFn: function (params) {
      const {fn, session, context, attempt} = params;
      return target.delay === undefined
        ? fn(context, session, attempt)
        : callAsync(target.delay, params);
    }
  };
  return target;
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
