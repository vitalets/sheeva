/**
 * Sessions manager
 */

const Session = require('./session');

module.exports = class Sessions {
  constructor() {
    this._envSessions = new Map();
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
    return session;
  }

  endSession(session) {
    return session.end();
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