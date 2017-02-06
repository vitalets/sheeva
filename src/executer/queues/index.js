/**
 * Tries to get next queue for execution.
 *
 * Algorithm depends on following:
 * - If we have running session, try to get queue for the same env
 * - If there is no session (empty slot) - try to get queue from env by order
 * - If there are queues in env we always PICK next whole queue
 * - If all queues of env are running and we get free session, we try to SPLIT part from one of running queues
 *
 */

const {config} = require('../../configurator');
const Picker = require('./picker');
const Splitter = require('../splitter');

module.exports = class Queues {
  /**
   * Constructor
   */
  constructor(slots, envFlatSuites) {
    this._slots = slots;
    this._envs = [];
    this._picker = new Picker(envFlatSuites);
    this._splitter = new Splitter(slots);
    this._session = null;
    this._env = null;
    this._fillEnvs(envFlatSuites);
  }

  /**
   * Tries to get next queue for provided session (env) or for any env.
   *
   * @param {Session} [session]
   * @returns {Queue|undefined}
   */
  tryGetNext(session) {
    this._session = session;
    this._env = session && session.env;
    return this._env && this._tryGetNextForEnv() || this._tryGetNextForAnyEnv();
  }

  /**
   * Returns remaining queues for env
   *
   * @param {Env} env
   * @returns {Array<Queue>}
   */
  getQueuesForEnv(env) {
    return this._picker.getQueuesForEnv(env);
  }

  _tryGetNextForEnv() {
    const envs = [this._env];
    return this._tryPickOrSplit(envs);
  }

  _tryGetNextForAnyEnv() {
    const envs = this._getPossibleEnvs();
    return this._tryPickOrSplit(envs);
  }

  /**
   * Tries get next queue from array of envs
   * - try pick whole queue
   * - try split longest running queue of envs
   */
  _tryPickOrSplit(envs) {
    return this._tryPick(envs) || this._trySplit(envs);
  }

  _tryPick(envs) {
    return this._picker.tryPick(envs);
  }

  _trySplit(envs) {
    if (config.splitFiles) {
      const options = this._getSplitterOptions();
      return this._splitter.trySplit(envs, options);
    }
  }

  _getPossibleEnvs() {
    return this._envs
      .filter(env => env !== this._env)
      .filter(env => !this._isEnvConcurrencyReached(env));
  }

  _isEnvConcurrencyReached(env) {
    return env.concurrency && env.concurrency === this._slots.getForEnv(env).length;
  }

  _fillEnvs(envFlatSuites) {
    envFlatSuites.forEach((flatSuites, env) => this._envs.push(env));
  }

  _getSplitterOptions() {
    return {
      isSessionStarted: Boolean(this._session && this._session.isStarted)
    };
  }

  _onBaseProps() {
    this._splitter.setBaseProps(this);
  }
};
