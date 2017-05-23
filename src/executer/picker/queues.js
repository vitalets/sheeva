/**
 * Picks whole queues from first suitable target
 */

const {result} = require('../../result');
const Queue = require('../queue');

module.exports = class Queues {
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
  pickNext(targets) {
    for (let target of targets) {
      const queues = this._targetQueues.get(target);
      if (queues.length) {
        // console.log(`${target.id}: picked queue with ${queues[0].tests.length} test(s)`);
        return queues.shift();
      }
    }
  }

  // todo: getRemainingQueues
  getRemaining(target) {
    return this._targetQueues.get(target);
  }

  _createQueues() {
    result.flatSuitesPerTarget.forEach((flatSuites, target) => {
      const queues = flatSuites.map(flatSuite => new Queue(flatSuite.tests));
      this._targetQueues.set(target, queues);
    });
  }
};
