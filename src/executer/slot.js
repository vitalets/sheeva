/**
 * Slot that can execute sessions serially
 */

module.exports = class Slot {
  /**
   * Constructor
   *
   * @param sessionManager
   */
  constructor(sessionManager) {
    this._sessionManager = sessionManager;
    this._endedSessions = [];
    this._currentSession = null;
  }

  get session() {
    return this._currentSession;
  }

  get sessions() {
    return this._endedSessions;
  }

  run(queue) {
    return Promise.resolve()
      .then(() => this._needNewSession(queue) ? this._ensureSession(queue) : null)
      .then(() => this._currentSession.run(queue));
  }

  end() {
    return this._currentSession ? this._deleteSession() : Promise.resolve();
  }

  _ensureSession(queue) {
    return this.end()
      .then(() => this._createSession(queue));
  }

  _createSession(queue) {
    this._currentSession = this._sessionManager.createSession(queue.suite.env);
  }

  _deleteSession() {
    return this._sessionManager.deleteSession(this._currentSession)
      .then(() => {
        this._endedSessions.push(this._currentSession);
        this._currentSession = null;
      });
  }

  _needNewSession(queue) {
    return !this._currentSession || this._sessionManager.newSessionPerFile || !this._isSameEnv(queue);
  }

  _isSameEnv(queue) {
    return queue.suite.env === this._currentSession.env;
  }
};
