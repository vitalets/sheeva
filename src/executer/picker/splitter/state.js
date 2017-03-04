/**
 * Store envs that can not be splitted
 */

module.exports = class State {
  constructor() {
    this._cantSplitForNewSession = new Set();
    this._cantSplitForStartedSession = new Set();
  }

  /**
   * Checks that env can be splitted
   *
   * @param {Env} env
   * @param {Boolean} isSessionStarted
   * @returns {Boolean}
   */
  canSplit(env, {isSessionStarted}) {
    return isSessionStarted
      ? this._canSplitForStartedSession(env)
      : this._canSplitForNewSession(env);
  }

  /**
   * Mark env not splittable for specified options
   * Note: if split is impossible for started session, it's for sure impossible for new session
   * as it requires time for session start, so always mark it
   *
   * @param {Env} env
   * @param {Boolean} isSessionStarted
   */
  setCantSplit(env, {isSessionStarted}) {
    this._cantSplitForNewSession.add(env);
    if (isSessionStarted) {
      this._cantSplitForStartedSession.add(env);
    }
  }

  _canSplitForStartedSession(env) {
    return !this._cantSplitForStartedSession.has(env);
  }

  _canSplitForNewSession(env) {
    return !this._cantSplitForNewSession.has(env);
  }
};
