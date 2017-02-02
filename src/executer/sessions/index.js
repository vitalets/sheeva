/**
 * Sessions manager
 *
 * @type {Sessions}
 */

const Base = require('../../base');
const Session = require('./session');

module.exports = class Sessions extends Base {
  /**
   * Constructor
   *
   * @param {Object} handlers
   * @param {Function} handlers.onSessionStart
   * @param {Function} handlers.onSessionEnd
   */
  constructor(handlers) {
    super();
    this._sessions = [];
    this._handlers = handlers;
  }

  createSession(env) {
    const index = this._sessions.length;
    const session = new Session(index, env).setBaseProps(this);
    this._sessions.push(session);
    return session;
  }

  startSession(session) {
    this._handlers.onSessionStart(session);
    return session.start();
  }

  endSession(session) {
    return session.end()
      .then(() => this._handlers.onSessionEnd(session));
  }

};
