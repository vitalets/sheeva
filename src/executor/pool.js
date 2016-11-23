/**
 * Controls concurrency pool of sessions
 * currently it does not start next env until current env is fully processed
 */

const Promised = require('../utils/promised');
const Session = require('./session');

module.exports = class Pool {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Reporter} options.reporter
   * @param {Config} options.config
   * @param {Function} options.getNextQueue
   */
  constructor(options) {
    this._options = options;
    this._isEnvEnd = false;
    this._canSplit = true;
    this._noMoreQueues = false;
    this._slots = new Set();
    this._sessionsCount = 0;
    this._promised = new Promised();
  }

  /**
   * Run
   */
  run() {
    return this._promised.call(() => this._startNextEnv());
  }

  _startNextEnv() {
    this._isEnvEnd = false;
    this._canSplit = true;
    this._fillSlots();
  }

  _fillSlots() {
    while (this._hasFreeSlots()) {
      const queue = this._getNextQueue();
      if (queue) {
        this._runOnNewSession(queue)
          .catch(e => this._promised.reject(e));
      } else {
        this._onFreeSlot();
        break;
      }
    }
  }

  _hasFreeSlots() {
    return this._slots.size < this._options.config.concurrency;
  }

  _getNextQueue() {
    if (this._isEnvEnd) {
      if (this._options.config.suiteSplit && this._canSplit) {
        // try split
        return null;
      } else {
        return null;
      }
    } else {
      const {queue, isLast} = this._options.getNextQueue();
      if (queue) {
        this._isEnvEnd = isLast;
      } else {
        this._noMoreQueues = true;
      }
      return queue;
    }
  }

  _processNextQueue(session) {
    const queue = this._getNextQueue();
    if (queue) {
      if (queue.suite.env === session.env) {
        return this._runOnExistingSession(queue, session);
      } else {
        return this._closeSession(session)
          .then(() => this._runOnNewSession(queue));
      }
    } else {
      return this._closeSession(session)
        .then(() => this._onFreeSlot());
    }
  }

  _runOnNewSession(queue) {
    return this._createSession(queue.suite.env)
      .then(session => this._runOnExistingSession(queue, session));
  }

  _runOnExistingSession(queue, session) {
    return queue.run(session)
      .then(() => this._processNextQueue(session));
  }

  _createSession(env) {
    const session = new Session({
      env,
      index: this._sessionsCount,
      reporter: this._options.reporter,
      config: this._options.config,
    });
    this._sessionsCount++;
    this._slots.add(session);
    return session.start()
      .then(() => session);
  }

  _closeSession(session) {
    return session.close()
      .then(() => this._slots.delete(session));
  }

  _onFreeSlot() {
    if (this._slots.size === 0) {
      if (this._noMoreQueues) {
        this._promised.resolve();
      } else {
        this._startNextEnv();
      }
    }
  }
};
