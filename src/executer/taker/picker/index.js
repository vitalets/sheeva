/**
 * Picks whole queue from first suitable target
 */

'use strict';

const {result} = require('../../../result');
const Queue = require('../../queue');

module.exports = class Picker {
  /**
   * Constructor
   */
  constructor() {
    this._targetQueues = new Map();
    this._createQueues();
  }

  /**
   * Picks first available queue from targets
   *
   * @param {Array} targets
   * @returns {Queue}
   */
  tryPick(targets) {
    for (let target of targets) {
      const queues = this._targetQueues.get(target);
      if (queues.length) {
        return queues.shift();
      }
    }
  }

  getRemainingQueues(target) {
    return this._targetQueues.get(target);
  }

  _createQueues() {
    result.flatSuitesPerTarget.forEach((flatSuites, target) => {
      const queues = flatSuites.map(flatSuite => new Queue(flatSuite.tests));
      this._targetQueues.set(target, queues);
    });
  }
};
