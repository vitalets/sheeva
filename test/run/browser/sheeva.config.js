'use strict';

/**
 * Browser sheeva config
 */

const ConsoleReporter = require('sheeva-reporter-console');
const baseConfig = require('../shared/base.sheeva.config');

module.exports = Object.assign({}, baseConfig, {
  // in browser concurrency > 1 breaks tests as now it is not possible to run several instances of Sheeva simultaneously
  concurrency: 1,
  files: 'specs.js',
  reporters: new ConsoleReporter(),
  createTargets: function () {
    return [
      {id: 'browser-sync', isTab: true},
    ];
  },
});
