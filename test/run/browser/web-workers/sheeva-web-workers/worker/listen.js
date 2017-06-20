/**
 * Worker entry
 */

'use strict';

const {START, EXECUTE, END} = require('../events');

module.exports = function (sheeva) {
  self.addEventListener('message', function (e) {
    const data = e.data;

    if (data.type === START) {
      sheeva.prepare();
    }

    if (data.type === EXECUTE) {
      const {targetId, flatSuiteIndex} = data.data;
      sheeva.execute({targetId, flatSuiteIndex});
    }

    if (data.type === END) {
      sheeva.end();
    }
  });
};
