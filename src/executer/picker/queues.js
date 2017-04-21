/**
 * Picks whole queues from first suitable env
 */

const {result} = require('../../result');
const Queue = require('../queue');

module.exports = class Queues {
  /**
   * Constructor
   */
  constructor() {
    this._envQueues = new Map();
    this._createQueues();
  }

  /**
   * Picks first available queue from envs
   *
   * @param {Array} envs
   * @returns {Queue}
   */
  pickNext(envs) {
    for (let env of envs) {
      const queues = this._envQueues.get(env);
      if (queues.length) {
        // console.log(`${env.id}: picked queue with ${queues[0].tests.length} test(s)`);
        return queues.shift();
      }
    }
  }

  // todo: getRemainingQueues
  getRemaining(env) {
    return this._envQueues.get(env);
  }

  _createQueues() {
    result.flatSuitesPerEnv.forEach((flatSuites, env) => {
      const queues = flatSuites.map(flatSuite => new Queue(flatSuite.tests));
      this._envQueues.set(env, queues);
    });
  }
};
