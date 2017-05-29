/**
 * Browser sheeva config
 */

const ConsoleReporter = require('sheeva-reporter-console');
const helper = require('../helper');
//const SubSheeva = require('../sub-sheeva');
const baseConfig = require('../base.sheeva.config');

module.exports = Object.assign({}, baseConfig, {
  concurrency: 5,
  // target: 'sync-target',
  files: 'specs.bundle.js',
  reporters: new ConsoleReporter(),
  startSession: function (session) {
    session.webWorker = new Worker('web-worker.js');
  },
  endSession: function (session) {
    session.webWorker.terminate();
  },
  callTestHookFn: function ({fn, session, context, hook, target}) {
    if (hook) {
      context.runOptions = context.runOptions || {};
      return fn(context);
    }

    const run = function (code, optionsFromTest = {}) {
      const subSheevaOptions = helper.getSubSheevaOptions(optionsFromTest, {fn, session, context, hook, target});
      //return new SubSheeva(code, subSheevaOptions).run();
      return runInWebWorker(session, code, subSheevaOptions);
    };
    return fn(run);
  },
});

function runInWebWorker(session, code, subSheevaOptions) {
  stringifyFunctions(subSheevaOptions);
  stringifyFunctions(subSheevaOptions.config);
  return new Promise((resolve, reject) => {
    session.webWorker.onmessage = event => {
      const {errorMsg, result, report} = event.data;
      if (errorMsg) {
        const error = new Error(errorMsg);
        Object.defineProperty(error, 'report', {value: report});
        Object.defineProperty(error, 'result', {value: result});
        reject(error);
      } else {
        resolve(result);
      }
    };
    session.webWorker.onerror = event => reject(new Error(event.message));
    session.webWorker.postMessage({code, subSheevaOptions});
  });
}

function stringifyFunctions(config) {
  Object.keys(config).forEach(key => {
    if (typeof config[key] === 'function') {
      config[key] = String(config[key]);
    }
  });
}
