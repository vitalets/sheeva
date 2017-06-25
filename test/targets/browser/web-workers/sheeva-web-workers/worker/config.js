/**
 * Worker entry
 */

'use strict';

const WorkerReporter = require('./reporter');

exports.get = function () {
  return {
    reporters: new WorkerReporter(),
  };
};
