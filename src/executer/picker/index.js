/**
 * Picks next queue for execution.
 */

const {config} = require('../../configurator');
const Queues = require('./queues');
const State = require('./state');
const Splitter = require('./splitter');

module.exports = class Picker {
  /**
   * Constructor
   */
  constructor(slots, envFlatSuites) {
    this._state = new State(slots, envFlatSuites);
    this._queues = new Queues(envFlatSuites);
    this._splitter = new Splitter(slots);
    this._session = null;
    this._env = null;
  }

  /**
   * Tries to pick next queue for provided session (env) or for any available env.
   *
   * - if there is passed session, try to pick queue for the same env first
   * - if there is no passed session (empty slot) - try to get queue from any available env (by order)
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
    const envs = this._state.getAvailableEnvs({exclude: this._env});
    return this._pickForEnvs(envs);
  }

  _pickForEnvs(envs) {
    return this._tryPickWholeQueue(envs) || this._trySplitRunningQueues(envs);
  }

  _tryPickWholeQueue(envs) {
    return this._queues.pickNext(envs);
  }

  _trySplitRunningQueues(envs) {
    if (config.splitFiles && envs.length) {
      const options = this._getSplitterOptions();
      return this._splitter.trySplit(envs, options);
    }
  }

  _getSplitterOptions() {
    return {
      isSessionStarted: Boolean(this._session && this._session.isStarted)
    };
  }
};
