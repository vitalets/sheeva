/**
 * Slot that can execute sessions serially
 */

const Base = require('../../base');

module.exports = class Slot extends Base {
  /**
   * Constructor
   *
   * @param sessionManager
   */
  constructor(sessionManager) {
    super();
    this._sessionManager = sessionManager;
    this._currentSession = null;
    this._currentQueue = null;
  }

  get session() {
    return this._currentSession;
  }

  get queue() {
    return this._currentQueue;
  }

  run(queue) {
    this._currentQueue = queue;
    return Promise.resolve()
      .then(() => this._needNewSession() ? this._reCreateSession() : null)
      .then(() => this._runQueue())
      .then(() => this._currentQueue = null);
  }

  deleteSession() {
    if (this._currentSession) {
      return this._sessionManager.endSession(this._currentSession)
        .then(() => this._currentSession = null);
    } else {
      return Promise.resolve();
    }
  }

  _reCreateSession() {
    return this.deleteSession()
      .then(() => this._createSession());
  }

  _createSession() {
    this._currentSession = this._sessionManager.createSession(this._currentQueue.suite.env);
    return this._sessionManager.startSession(this._currentSession);
  }

  _needNewSession() {
    return !this._currentSession || this._config.newSessionPerFile || !this._isSameEnv();
  }

  _runQueue() {
    return this._currentSession.run(this._currentQueue);
  }

  _isSameEnv() {
    return this._currentQueue.suite.env === this._currentSession.env;
  }
};
