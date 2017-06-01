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
  // target: 'sync-target',
  files: 'specs.js',
  reporters: new ConsoleReporter(),
  createTargets: function () {
    const targets = baseConfig.createTargets()
      .map(target => Object.assign(target, {isWebWorker: true}));
    // special target to run tests in tab (not web-worker)
    targets.push({
      id: 'sync-target-tab',
      concurrency: 1,
      isTab: true,
    });
    return targets;
  },
  startSession: function (session) {
    if (!session.target.isTab) {
      session.webWorker = new Worker('web-worker.js');
    }
  },
  endSession: function (session) {
    if (!session.target.isTab) {
      session.webWorker.terminate();
    }
  },
  callTestFn: function (params) {
    const run = function (code, optionsFromTest = {}) {
      const subSheevaOptions = helper.getSubSheevaOptions(optionsFromTest, params);
      return params.target.isTab
        ? new SubSheeva(code, subSheevaOptions).run()
        : runInWebWorker(params.session.webWorker, code, subSheevaOptions);
    };
    return params.fn(run);
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
