/**
 * Slot that can execute sessions serially.
 */

const {config} = require('../../configurator');

module.exports = class Slot {
  /**
   * Constructor
   *
   * @param {Number} index
   * @param {Sessions} sessions
   */
  constructor(index, sessions) {
    this._index = index;
    this._sessions = sessions;
    this._session = null;
    this._queue = null;
    this._deleting
  }

  get index() {
    return this._index;
  }

  get session() {
    return this._session;
  }

  get queue() {
    return this._queue;
  }

  run(queue) {
    this._queue = queue;
    return Promise.resolve()
      .then(() => this._needNewSession() ? this._reCreateSession() : null)
      .then(() => this._runQueue())
      .then(() => this._queue = null);
  }

  deleteSession() {
    if (this._session) {
      const session = this._session;
      return this._session.end()
      // need this._session = null before handling session end (todo: make it more elegant)
        .finally(() => this._session = null)
        .then(() => this._sessions.handleSessionEnd(session));
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Checks that slot is holding env.
   * Actually, slot can hold two envs simultaneously when queue is assigned,
   * but previous session is still ending
   *
   * @returns {Boolean}
   */
  isHoldingEnv(env) {
    return [
      this._session && this._session.env === env,
      this._queue && this._queue.env === env,
    ].some(Boolean);
  }

  _reCreateSession() {
    return Promise.resolve()
      .then(() => this.deleteSession())
      .then(() => this._createSession());
  }

  _createSession() {
    this._session = this._sessions.createSession(this._index, this._queue.env);
    return this._session.start();
  }

  _needNewSession() {
    return !this._session || config.newSessionPerFile || this._session.env !== this._queue.env;
  }

  _runQueue() {
    return this._queue.runOn(this._session);
  }
};
