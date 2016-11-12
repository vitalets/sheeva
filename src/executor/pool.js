/**
 * Controls concurrency pool of sessions
 */

const utils = require('../utils');
const Session = require('./session');

module.exports = class Pool {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Reporter} options.reporter
   * @param {Config} options.config
   * @param {Function} options.getQueue
   */
  constructor(options) {
    this._reporter = options.reporter;
    this._config = options.config;
    this._getQueue = options.getQueue;
    this._slots = new Set();
    this._promised = new utils.Promised();
  }

  /**
   * Run
   */
  run() {
    return this._promised.call(() => this._fillSlots());
  }

  _hasFreeSlots() {
    return this._slots.size < this._config.concurrency;
  }

  _fillSlots() {
    while (this._hasFreeSlots()) {
      const queue = this._getQueue();
      if (queue) {
        this._runOnNewSession(queue)
          .catch(e => console.log(e))
      } else {
        break;
      }
    }
  }

  _processNextQueue(session) {
    const queue = this._getQueue();
    if (queue) {
      if (queue.suite.env === session.env) {
        return this._runOnExistingSession(queue, session);
      } else {
        return Promise.resolve()
          .then(() => this._closeSession(session))
          .then(() => this._runOnNewSession(queue));
      }
    } else {
      return Promise.resolve()
        .then(() => session ? this._closeSession(session) : null)
        .then(() => this._slots.size === 0 ? this._promised.resolve() : null);
    }
  }

  _runOnNewSession(queue) {
    return Promise.resolve()
      .then(() => this._createSession(queue.suite.env))
      .then(session => this._runOnExistingSession(queue, session));
  }

  _runOnExistingSession(queue, session) {
    return Promise.resolve()
      .then(() => queue.run(session))
      .then(() => this._processNextQueue(session));
  }

  _createSession(env) {
    const session = new Session({
      env,
      reporter: this._reporter,
      config: this._config,
    });
    this._slots.add(session);
    return session.start()
      .then(() => session);
  }

  _closeSession(session) {
    return session.close()
      .then(() => this._slots.delete(session));
  }
};
