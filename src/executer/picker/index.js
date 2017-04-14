/**
 * Picks next queue for execution.
 */

const {config} = require('../../config');
const Queues = require('./queues');
const Splitter = require('./splitter');

module.exports = class Picker {
  /**
   * Constructor
   */
  constructor(workers) {
    this._workers = workers;
    this._queues = new Queues();
    this._splitter = new Splitter(workers);
    this._session = null;
    this._env = null;
  }

  /**
   * Tries to pick next queue for provided session (env) or for any available env.
   *
   * - if there is passed session, try to pick queue for the same env first
   * - if there is no passed session (empty worker) - try to get queue from any available env (by order)
   *
   * @param {Session} [session]
   * @returns {Queue|undefined}
   */
  pickNextQueue(session) {
    this._session = session;
    this._env = session && session.env;
    return this._env && this._pickForSingleEnv(this._env) || this._pickForAvailableEnvs();
  }

  /**
   * Returns remaining queues for env
   *
   * @param {Env} env
   * @returns {Array<Queue>}
   */
  getRemainingQueues(env) {
    return this._queues.getRemaining(env);
  }

  _pickForSingleEnv(env) {
    const envs = [env];
    return this._pickForEnvs(envs);
  }

  _pickForAvailableEnvs() {
    const envs = this._getAvailableEnvs();
    return this._pickForEnvs(envs);
  }

  _pickForEnvs(envs) {
    return this._tryPickWholeQueue(envs) || this._trySplitRunningQueues(envs);
  }

  _tryPickWholeQueue(envs) {
    return this._queues.pickNext(envs);
  }

  _trySplitRunningQueues(envs) {
    if (config.splitSuites && envs.length) {
      const options = this._getSplitterOptions();
      return this._splitter.trySplit(envs, options);
    }
  }

  _getAvailableEnvs() {
    return config.envs
      .filter(env => env !== this._env)
      .filter(env => !this._isEnvConcurrencyReached(env));
  }

  _isEnvConcurrencyReached(env) {
    return env.concurrency && env.concurrency === this._workers.getWorkersForEnv(env).length;
  }

  _getSplitterOptions() {
    return {
      isSessionStarted: Boolean(this._session && this._session.isStarted)
    };
  }
};
