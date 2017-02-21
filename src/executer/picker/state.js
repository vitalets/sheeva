/**
 * Returns available envs (from which queue can be picked now).
 */

module.exports = class State {
  constructor(slots, envFlatSuites) {
    this._slots = slots;
    this._envs = [];
    this._fillEnvs(envFlatSuites);
  }

  getAvailableEnvs(options = {}) {
    return this._envs
      .filter(env => env !== options.exclude)
      .filter(env => !this._isEnvConcurrencyReached(env));
  }

  _isEnvConcurrencyReached(env) {
    return env.concurrency && env.concurrency === this._getEnvSlots(env).length;
  }

  _getEnvSlots(env) {
    return this._slots.toArray().filter(slot => slot.isHoldingEnv(env));
  }

  _fillEnvs(envFlatSuites) {
    envFlatSuites.forEach((flatSuites, env) => this._envs.push(env));
  }
};
