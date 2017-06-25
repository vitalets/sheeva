'use strict';

const Sheeva = require('../../../../dist/sheeva');
const baseConfig = require('./sheeva.config');
const workerUtils = require('./sheeva-web-workers/worker');

const config = Object.assign({}, baseConfig, workerUtils.config.get(), {
  concurrency: 1,
  splitRunningSuites: true,
});
const sheeva = new Sheeva(config);
workerUtils.listen(sheeva);
