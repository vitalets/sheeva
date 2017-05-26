/**
 * Browser sheeva config
 */

const baseConfig = require('../base.sheeva.config');
const DebugReporter = require('../debug-reporter');

module.exports = Object.assign({}, baseConfig, {
  files: 'specs.bundle.js',
  reporters: new DebugReporter(),
});
