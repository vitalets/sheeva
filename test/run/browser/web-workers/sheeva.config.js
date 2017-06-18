'use strict';

/**
 * Browser sheeva config
 */

const ConsoleReporter = require('sheeva-reporter-console');
const commonConfig = require('./common.sheeva.config');

module.exports = Object.assign({}, commonConfig, {
  concurrency: 5,
  reporters: new ConsoleReporter(),
  startWorker: function (worker) {
    worker.webWorker = new Worker('worker.js');
    // pass tests chunk
    // webWorker.postMessage({code, subSheevaOptions});
  },
  endWorker: function (worker) {
    worker.webWorker.terminate();
  },
});

/*
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
*/
