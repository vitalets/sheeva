/**
 * Item of Pool holding running session and queue
 *
 * @type {Worker}
 */

const Session = require('./session');

module.exports = class Worker {

  constructor(options) {
    this._options = options;
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
    if (!this._session) {
      return this._runOnNewSession();
    } else {
      return this._isEnvChanged()
        ? this._closeSession().then(() => this._runOnNewSession())
        : this._runOnExistingSession();
    }
  }

  close() {
    return this._session ? this._closeSession() : Promise.resolve();
  }

  _runOnNewSession() {
    return this._createSession()
      .then(() => this._runOnExistingSession());
  }

  _runOnExistingSession() {
    return this._queue.run(this._session.caller)
      .then(() => this._queue = null);
  }

  _createSession() {
    this._session = new Session({
      env: this._queue.suite.env,
      index: Math.random(),
      reporter: this._options.reporter,
      config: this._options.config,
    });
    //this._sessionsCount++;
    //this._slots.set(session, queue);
    return this._session.start();
  }

  _closeSession() {
    return this._session.close()
      .then(() => this._session = null);
  }

  _isEnvChanged() {
    return this._queue.suite.env !== this._session.env;
  }
};
