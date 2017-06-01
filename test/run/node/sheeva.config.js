'use strict';

/**
 * Node sheeva config
 */

process.on('unhandledRejection', r => console.error(r)); // eslint-disable-line no-console
require('source-map-support').install();
const helper = require('../helper');
const SubSheeva = require('../sub-sheeva');
const baseConfig = require('../base.sheeva.config');
const ConsoleReporter = require('sheeva-reporter-console');
const append = process.env.TRAVIS || process.env.SHEEVA_APPEND;

module.exports = Object.assign({}, baseConfig, {
  files: './test/specs',
  reporters: new ConsoleReporter({append}),
  callTestFn: function (params) {
    const run = function (code, optionsFromTest = {}) {
      const subSheevaOptions = helper.getSubSheevaOptions(optionsFromTest, params);
      return new SubSheeva(code, subSheevaOptions).run();
    };
    return params.fn(run);
  },
});
