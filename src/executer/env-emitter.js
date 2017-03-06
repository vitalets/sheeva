/**
 * Emits ENV_START / ENV_END events
 */

const reporter = require('../reporter');
const {ENV_START, ENV_END} = require('../events');

module.exports = class EnvEmitter {
  /**
   * Constructor
   */
  constructor(workers, picker) {
    this._workers = workers;
    this._picker = picker;
    this._startedEnvs = new Set();
    this._setWorkerHandlers();
  }

  _setWorkerHandlers() {
    this._workers.onSessionStart = session => this._checkEnvStart(session.env);
    this._workers.onSessionEnd = session => this._checkEnvEnd(session.env);
  }

  _checkEnvStart(env) {
    if (!this._startedEnvs.has(env)) {
      this._startedEnvs.add(env);
      reporter.handleEvent(ENV_START, {env});
    }
  }

  _checkEnvEnd(env) {
    if (!this._hasQueues(env) && !this._hasWorkers(env)) {
      reporter.handleEvent(ENV_END, {env});
    }
  }

  _hasQueues(env) {
    return this._picker.getRemainingQueues(env).length > 0;
  }

  _hasWorkers(env) {
    return this._workers.toArray().some(worker => worker.isHoldingEnv(env));
  }
};
