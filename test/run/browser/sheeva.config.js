/**
 * Browser sheeva config
 */

const ConsoleReporter = require('sheeva-reporter-console');
const baseConfig = require('../base.sheeva.config');

module.exports = Object.assign({}, baseConfig, {
  files: 'specs.bundle.js',
  reporters: new ConsoleReporter(),
});
