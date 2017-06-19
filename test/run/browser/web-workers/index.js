'use strict';

const ConsoleReporter = require('sheeva-reporter-console');
const Sheeva = require('../../../../dist/sheeva');
const config = require('./sheeva.config');
const {masterConfig, workerConfig, runAsWorker} = require('./web-workers');

if (typeof window !== 'undefined') {
  runMaster();
} else {
  runWorker();
}

function runMaster() {
  Object.assign(config, masterConfig, {
    concurrency: 5,
    splitSuites: false,
    reporters: new ConsoleReporter(),
  });
  const sheeva = new Sheeva(config);
  sheeva.run();
}

function runWorker() {
  Object.assign(config, workerConfig, {
    concurrency: 1,
  });
  const sheeva = new Sheeva(config);
  runAsWorker(sheeva);
}
