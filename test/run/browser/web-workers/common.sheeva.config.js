'use strict';

/**
 * Browser sheeva config
 */

const baseConfig = require('../../shared/base.sheeva.config');

const req = require.context('../../../specs', true, /\.js$/);
const files = req.keys().map(name => {
  return {name, content: () => req(name)};
});

module.exports = Object.assign({}, baseConfig, {
  target: 'web-worker-sync',
  files,
  createTargets: function () {
    return [
      {id: 'web-worker-sync', isWebWorker: true},
      {id: 'web-worker-async', isWebWorker: true, delay: 10},
    ];
  },
});
