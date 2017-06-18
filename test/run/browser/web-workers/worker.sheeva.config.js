'use strict';

/**
 * Browser sheeva config
 */

const WorkerReporter = require('./worker-reporter');
const commonConfig = require('./common.sheeva.config');

module.exports = Object.assign({}, commonConfig, {
  concurrency: 1,
  reporters: new WorkerReporter(),
});
