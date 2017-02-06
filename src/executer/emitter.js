/**
 * Emits ENV_START / ENV_END
 */

const reporter = require('../reporter');
const {ENV_START, ENV_END} = require('../events');

module.exports = class Emitter {
  /**
   * Constructor
   */
  constructor(slots, queues, envFlatSuites) {
    this._startedEnvs = new Set();
    this._slots = slots;
    this._queues = queues;
    this._envFlatSuites = envFlatSuites;
  }

  checkEnvStart(env) {
    if (!this._startedEnvs.has(env)) {
      this._startedEnvs.add(env);
      this._emitEnvStart(env);
    }
  }

  checkEnvEnd(env) {
    if (this._hasQueues(env) && this._hasSlots(env)) {
      this._emitEnvEnd(env);
    }
  }

  _hasQueues(env) {
    return this._queues.getQueuesForEnv(env).length > 0;
  }

  _hasSlots(env) {
    return this._slots.getForEnv(env).length > 0;
  }

  _emitEnvStart(env) {
    reporter.handleEvent(ENV_START, {
      env,
      testsCount: this._calcTestsCount(env)
    });
  }

  _emitEnvEnd(env) {
    reporter.handleEvent(ENV_END, {env});
  }

  _calcTestsCount(env) {
    return this._envFlatSuites.get(env).reduce((res, flatSuite) => res + flatSuite.tests.length, 0);
  }
};
