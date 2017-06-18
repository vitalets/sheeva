/**
 * Shifts whole queue from first suitable target
 */

'use strict';

const state = require('../../../state');
const Queue = require('../../queue');

module.exports = class Shifter {
  /**
   * Constructor
   */
  constructor() {
    this._targetQueues = new Map();
    this._flatSuitesPerTarget = state.flatSuitesPerTarget;
    this._createQueues();
  }

  /**
   * Shifts first available queue from targets
   *
   * @param {Array} targets
   * @returns {Queue}
   */
  tryShift(targets) {
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
    this._flatSuitesPerTarget.forEach((flatSuites, target) => {
      const queues = flatSuites.map(flatSuite => new Queue(flatSuite.tests));
      this._targetQueues.set(target, queues);
    });
  }
};
