/**
 * Splitter state
 */

module.exports = class State {
  constructor() {
    this._forStartedSession = false;
    this._unsplittableForNewSession = new Set();
    this._unsplittableForStartedSession = new Set();
  }

  set forStartedSession(value) {
    this._forStartedSession = value;
  }

  /**
   *
   * @param {Array<Env>} envs
   * @returns {Set}
   */
  getSplittableEnvs(envs) {
    const result = envs
      .filter(env => this._canSplit(env))
      .map(env => [env, env]);

    return new Set(result);
  }

  /**
   * Mark env unsplittable for specified options
   * Note: if split is impossible for started session, it's for sure impossible for new session
   * as it requires time for session start, so always mark it
   *
   * @param {Env} env
   */
  markUnsplittable(env) {
    this._unsplittableForNewSession.add(env);
    if (this._forStartedSession) {
      this._unsplittableForStartedSession.add(env);
    }
  }

  _canSplit(env) {
    return this._forStartedSession
      ? !this._unsplittableForStartedSession.has(env)
      : !this._unsplittableForNewSession.has(env)
  }
};
