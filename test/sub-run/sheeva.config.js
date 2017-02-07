/**
 * Sub-run config that is extended dynamically in tests
 */

module.exports = {
  concurrency: 1,
  reporters: require('./reporter'),
  splitFiles: false,
  createEnvs: function () {
    return [{id: 'env1'}];
  },
  // for debug
  log: function() {
    console.log.apply(console, arguments);
  }
};
