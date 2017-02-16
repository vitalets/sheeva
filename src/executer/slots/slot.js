/**
 * Slot that can execute sessions serially.
 */

const {config} = require('../../configurator');
const Session = require('./session');

module.exports = class Slot {
  /**
   * Constructor
   *
   * @param {Object} handlers
   * @param {Function} handlers.onSessionStart
   * @param {Function} handlers.onSessionEnd
   */
  constructor(handlers) {
    this._handlers = handlers;
    this._session = null;
    this._queue = null;
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
      return this._session.end()
        .then(() => this._onSessionEnd());
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
    this._session = new Session(this._queue.env);
    this._handlers.onSessionStart(this._session);
    return this._session.start();
  }

  _needNewSession() {
    return !this._session || config.newSessionPerFile || this._session.env !== this._queue.env;
  }

  _runQueue() {
    return this._queue.runOn(this._session);
  }

  _onSessionEnd() {
    const session = this._session;
    this._session = null;
    this._handlers.onSessionEnd(session);
  }
};
