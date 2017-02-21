/**
 * Picks whole queues from first suitable env
 */

const Queue = require('../queue');

module.exports = class Queues {
  /**
   * Constructor
   *
   * @param {Map<Env, Array<FlatSuite>>} envFlatSuites
   */
  constructor(envFlatSuites) {
    this._envQueues = new Map();
    this._createQueues(envFlatSuites);
  }

  pickNext(envs) {
    for (let env of envs) {
      const queues = this._envQueues.get(env);
      if (queues.length) {
        // console.log(`${env.id}: picked queue with ${queues[0].tests.length} test(s)`);
        return queues.shift();
      }
    }
  }

  getRemaining(env) {
    return this._envQueues.get(env);
  }

  _createQueues(envFlatSuites) {
    envFlatSuites.forEach((flatSuites, env) => {
      const queues = flatSuites.map(flatSuite => new Queue(flatSuite.tests));
      this._envQueues.set(env, queues);
    });
  }
};
