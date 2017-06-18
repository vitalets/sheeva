/**
 * Browser sheeva config
 */

'use strict';

const ConsoleReporter = require('sheeva-reporter-console');
const baseConfig = require('../../base.sheeva.config');

const req = require.context('../../../specs', true, /\.js$/);
const files = req.keys().map(name => {
  return {name, content: () => req(name)};
});

module.exports = Object.assign({}, baseConfig, {
  // in browser concurrency > 1 breaks tests as now it is not possible to run several instances of Sheeva simultaneously
  concurrency: 1,
  files,
  reporters: new ConsoleReporter(),
  createTargets: function () {
    return [
      {id: 'browser-sync', isTab: true},
    ];
  },
});
