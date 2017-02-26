/**
 * Main selftest runner
 */

require('./globals');
const subSheeva = require('./sub-sheeva');

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
  callTestHookFn: function ({fn, session, context, hook, env}) {
    if (hook) {
      context.runOptions = context.runOptions || {};
      return fn(context);
    }

    const subConfig = {
      callTestHookFn: env.delay === undefined ? callSync : callAsync.bind(null, env.delay)
    };

    const run = function (code, options = {}) {
      options.config = Object.assign(subConfig, options.config);
      const finalOptions = Object.assign({session}, context.runOptions, options);
      return subSheeva.run(code, finalOptions);
    };
    return fn(run);
  },
};

function callSync({fn, session, context}) {
  return fn(session, context);
}

function callAsync(delay, {fn, session, context}) {
  if (fn !== noop) {
    return fn(session, context);
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        fn(session, context);
        resolve();
      } catch(e) {
        reject(e);
      }
    }, delay)
  });
}
