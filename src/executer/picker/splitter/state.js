'use strict';

/**
 * Store targets that can not be splitted
 */

module.exports = class State {
  constructor() {
    this._cantSplitForNewSession = new Set();
    this._cantSplitForStartedSession = new Set();
  }

  /**
   * Checks that target can be splitted
   *
   * @param {Target} target
   * @param {Boolean} isSessionStarted
   * @returns {Boolean}
   */
  canSplit(target, {isSessionStarted}) {
    return isSessionStarted
      ? this._canSplitForStartedSession(target)
      : this._canSplitForNewSession(target);
  }

  /**
   * Mark target not splittable for specified options
   * Note: if split is impossible for started session, it's for sure impossible for new session
   * as it requires time for session start, so always mark it
   *
   * @param {Target} target
   * @param {Boolean} isSessionStarted
   */
  setCantSplit(target, {isSessionStarted}) {
    this._cantSplitForNewSession.add(target);
    if (isSessionStarted) {
      this._cantSplitForStartedSession.add(target);
    }
  }

  _canSplitForStartedSession(target) {
    return !this._cantSplitForStartedSession.has(target);
  }

  _canSplitForNewSession(target) {
    return !this._cantSplitForNewSession.has(target);
  }
};
