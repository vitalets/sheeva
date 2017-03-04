/**
 * Emits ENV_START / ENV_END events
 */

const reporter = require('../reporter');
const {ENV_START, ENV_END} = require('../events');

module.exports = class EnvEmitter {
  /**
   * Constructor
   */
  constructor(slots, picker) {
    this._slots = slots;
    this._picker = picker;
    this._startedEnvs = new Set();
    this._setSlotsHandlers();
  }

  _setSlotsHandlers() {
    this._slots.onSessionStart = session => this._checkEnvStart(session.env);
    this._slots.onSessionEnd = session => this._checkEnvEnd(session.env);
  }

  _checkEnvStart(env) {
    if (!this._startedEnvs.has(env)) {
      this._startedEnvs.add(env);
      reporter.handleEvent(ENV_START, {env});
    }
  }

  _checkEnvEnd(env) {
    if (!this._hasQueues(env) && !this._hasSlots(env)) {
      reporter.handleEvent(ENV_END, {env});
    }
  }

  _hasQueues(env) {
    return this._picker.getRemainingQueues(env).length > 0;
  }

  _hasSlots(env) {
    return this._slots.toArray().some(slot => slot.isHoldingEnv(env));
  }
};
