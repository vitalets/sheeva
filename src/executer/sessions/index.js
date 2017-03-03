/**
 * Sessions manager
 */

const Session = require('./session');

module.exports = class Sessions {
  constructor() {
    this._envSessions = new Map();
    this._onSessionStart = () => {};
    this._onSessionEnd = () => {};
  }

  set onSessionStart(handler) {
    this._onSessionStart = handler;
  }

  set onSessionEnd(handler) {
    this._onSessionEnd = handler;
  }

  /**
   * Returns sessioins for env
   *
   * @param {Env} env
   * @returns {Array<Session>}
   */
  getSessionsForEnv(env) {
    return this._envSessions.get(env) || [];
  }

  /**
   * Creates new session
   *
   * @param {Number} slotIndex
   * @param {Env} env
   * @returns {Session}
   */
  createSession(slotIndex, env) {
    const sessions = this._getSessions(env);
    const index = sessions.length;
    const session = new Session({index, slotIndex, env});
    sessions.push(session);
    this._onSessionStart(session);
    return session;
  }

  handleSessionEnd(session) {
    return this._onSessionEnd(session);
  }

  _getSessions(env) {
    let sessions = this._envSessions.get(env);
    if (!sessions) {
      sessions = [];
      this._envSessions.set(env, sessions);
    }
    return sessions;
  }
};
