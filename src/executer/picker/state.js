/**
 * Returns available envs (from which queue can be picked now).
 */

module.exports = class State {
  constructor(workers, envFlatSuites) {
    this._workers = workers;
    this._envs = [];
    this._fillEnvs(envFlatSuites);
  }

  getAvailableEnvs(options = {}) {
    return this._envs
      .filter(env => env !== options.exclude)
      .filter(env => !this._isEnvConcurrencyReached(env));
  }

  _isEnvConcurrencyReached(env) {
    return env.concurrency && env.concurrency === this._getEnvWorkers(env).length;
  }

  _getEnvWorkers(env) {
    return this._workers.toArray().filter(worker => worker.isHoldingEnv(env));
  }

  _fillEnvs(envFlatSuites) {
    envFlatSuites.forEach((flatSuites, env) => this._envs.push(env));
  }
};
