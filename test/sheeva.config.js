/**
 * Main selftest runner
 */

require('./sub-run');

module.exports = {
  concurrency: 5,
  files: './test/specs/**/*.test.js',
  //files: './test/specs/only.test.js',
  newSessionPerFile: false,
  splitFiles: true,
  reporters: require('sheeva-reporter-progress'),
  //reporters: require('./debug-reporter'),
  createEnvs: function () {
    return [
      //{id: 'tests-async0', delay: 50},
      {id: 'tests-sync'},
      {id: 'tests-async', delay: 10},
     // {id: 'tests-async1', delay: 10},
      //{id: 'tests-async2', delay: 30},
      //{id: 'tests-async3', delay: 50},
      //{id: 'tests-sync'},
      //{id: 'tests-async4', delay: 100},
    ];
  },
  startSession: function (session) {

  },
  callTestHookFn: function ({fn, session, context, hook, env}) {
    if (hook) {
      context.runOptions = context.runOptions || {};
      return fn(context);
    }
    const baseConfig = {
      callTestHookFn: env.delay === undefined ? callSync : callAsync.bind(null, env.delay)
    };
    const run = function (code, options = {}) {
      options.config = Object.assign({}, baseConfig, options.config);
      const finalOptions = Object.assign({session}, context.runOptions, options);
      return global.run(code, finalOptions);
    };
    return fn(run);
  },
  // for debug
  log: function() {
    // console.log.apply(console, arguments);
  }
};

function callSync({fn, session, context}) {
  return fn(session, context);
}

function callAsync(delay, {fn, session, context}) {
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
