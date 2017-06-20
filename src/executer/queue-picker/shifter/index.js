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
    this._flatSuitesPerTarget = state.filteredFlatSuitesPerTarget;
  }

  /**
   * Shifts first available queue from targets
   *
   * @param {Array} targets
   * @returns {Queue}
   */
  tryShift(targets) {
    for (let target of targets) {
      const flatSuites = this._flatSuitesPerTarget.get(target);
      if (flatSuites.length) {
        const flatSuite = flatSuites.shift();
        return new Queue(flatSuite);
      }
    }
  }

  /**
   * Does target have pending tests (flat suites)
   *
   * @param {Target} target
   */
  hasPendingTestsForTarget(target) {
    return Boolean(this._flatSuitesPerTarget.get(target).length);
  }
};
