/**
 * Emits ENV_START / ENV_END
 */

const Base = require('../base');
const {ENV_START, ENV_END} = require('../events');

module.exports = class Emitter extends Base {
  /**
   * Constructor
   */
  constructor(slots, queues, envFlatSuites) {
    super();
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
    if (this._queues.getQueuesForEnv(env).length === 0 && this._slots.getForEnv(env).length === 0) {
      this._emitEnvEnd(env);
    }
  }

  _emitEnvStart(env) {
    this._emit(ENV_START, {
      env,
      testsCount: this._calcTestsCount(env)
    });
  }

  _emitEnvEnd(env) {
    this._emit(ENV_END, {env});
  }

  _calcTestsCount(env) {
    return this._envFlatSuites.get(env).reduce((res, flatSuite) => res + flatSuite.tests.length, 0);
  }
};
