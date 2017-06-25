'use strict';

const ConsoleReporter = require('sheeva-reporter-console');
const Sheeva = require('../../../../dist/sheeva');
const baseConfig = require('./sheeva.config');
const masterUtils = require('./sheeva-web-workers/master');

const workerUrl = 'worker.js';
const config = Object.assign({}, baseConfig, masterUtils.config.get({workerUrl}), {
  concurrency: 4,
  splitSuites: false,
  reporters: new ConsoleReporter(),
});
new Sheeva(config).run();
