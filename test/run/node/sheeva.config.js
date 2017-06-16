'use strict';

/**
 * Node sheeva config
 */

process.on('unhandledRejection', r => console.error(r)); // eslint-disable-line no-console
require('source-map-support').install();
const baseConfig = require('../shared/base.sheeva.config');
const ConsoleReporter = require('sheeva-reporter-console');
const append = process.env.TRAVIS || process.env.SHEEVA_APPEND;

module.exports = Object.assign({}, baseConfig, {
  files: './test/specs',
  reporters: new ConsoleReporter({append}),
  createTargets: function () {
    return [
      {id: 'node-sync'},
      {id: 'node-async', delay: 10},
    ];
  },
});
