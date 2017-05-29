'use strict';

/**
 * Base config for self-testing
 */

require('./globals');

module.exports = {
  concurrency: 5,
  newSessionPerFile: false,
  splitSuites: true,
  createTargets: function () {
    return [
      {id: 'sync-target'},
      {id: 'async-target', delay: 10},
    ];
  },
};
