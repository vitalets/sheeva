/**
 * Session manager
 *
 * @type {SessionManager}
 */

const Session = require('./session');
const Base = require('./base');

module.exports = class SessionManager extends Base {
  /**
   * Constructor
   *
   * @param {Map} state
   */
  constructor(state) {
    super();
    this._state = state;
    this._sessions = [];
  }

  get newSessionPerFile() {
    return this._config.newSessionPerFile;
  }

  createSession(env) {
    const index = this._sessions.length;
    const session = new Session(index, env).setBaseProps(this);
    this._sessions.push(session);
    return session;
  }

  deleteSession(session) {
    return session.end()
      .then(() => this._checkEnvEnded(session));
  }

  _checkEnvEnded(session) {
    return this._state.get(session.env).checkEnd();
  }
};
