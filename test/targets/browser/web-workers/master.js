'use strict';

const ConsoleReporter = require('sheeva-reporter-console');
// const DebugReporter = require('../../../helpers/debug-reporter');
const Sheeva = require('../../../../dist/sheeva');
const baseConfig = require('./sheeva.config');
const masterUtils = require('./sheeva-web-workers/master');

const workerUrl = 'worker.js';
const config = Object.assign({}, baseConfig, masterUtils.config.get({workerUrl}), {
  concurrency: 4,
  splitRunningSuites: false,
  breakOnError: true,
  reporters: new ConsoleReporter(),
  //reporters: new DebugReporter(),
});
new Sheeva(config).run();
