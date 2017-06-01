'use strict';

/**
 * Browser sheeva config
 */

const ConsoleReporter = require('sheeva-reporter-console');
const helper = require('../helper');
const SubSheeva = require('../sub-sheeva');
const baseConfig = require('../base.sheeva.config');

module.exports = Object.assign({}, baseConfig, {
  concurrency: 5,
  // target: 'web-worker-sync',
  files: 'specs.js',
  reporters: new ConsoleReporter(),
  createTargets: function () {
    return [
      {id: 'tab-sync', isTab: true, concurrency: 1},
      {id: 'tab-async', isTab: true, delay: 10, concurrency: 1},
      {id: 'web-worker-sync', isWebWorker: true},
      {id: 'web-worker-async', isWebWorker: true, delay: 10},
    ];
  },
  startSession: function (session) {
    if (session.target.isWebWorker) {
      session.webWorker = new Worker('web-worker.js');
    }
  },
  endSession: function (session) {
    if (session.target.isWebWorker) {
      session.webWorker.terminate();
    }
  },
  callTestFn: function (params) {
    const {fn, target, session} = params;
    const run = (code, optionsFromTest = {}) => {
      const subSheevaOptions = helper.getSubSheevaOptions(optionsFromTest, params);
      return target.isWebWorker
        ? runInWebWorker(session.webWorker, code, subSheevaOptions)
        : new SubSheeva(code, subSheevaOptions).run();
    };
    return fn(run);
  },
});

function runInWebWorker(webWorker, code, subSheevaOptions) {
  stringifyFunctions(subSheevaOptions);
  stringifyFunctions(subSheevaOptions.config);
  return new Promise((resolve, reject) => {
    webWorker.onmessage = event => {
      const {errorMsg, output} = event.data;
      if (errorMsg) {
        const error = new Error(errorMsg);
        Object.defineProperty(error, 'output', {value: output});
        reject(error);
      } else {
        resolve(output);
      }
    };
    webWorker.onerror = event => reject(new Error(event.message));
    webWorker.postMessage({code, subSheevaOptions});
  });
}

function stringifyFunctions(config) {
  Object.keys(config).forEach(key => {
    if (typeof config[key] === 'function') {
      config[key] = String(config[key]);
    }
  });
}
