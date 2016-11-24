/**
 * Controls concurrency pool of sessions
 * currently it does not start next env until current env is fully processed
 */

const Promised = require('../utils/promised');
const Session = require('./session');
const Splitter = require('./splitter');

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
    /**
     * Flag that last queue of env reached and we are ready for suite split
     */
    this._isEnvEnd = false;
    /**
     * Flag showing that suite splitting is still possible,
     * otherwise other sessions will not even try
     */
    this._isSplitPossible = false;
    /**
     * Flag showing that there are no more queues so we wait for current sessions to finish
     */
    this._isQueuesEnd = false;
    /**
     * Map of slots for running (session, queue), limited by concurrency
     */
    this._slots = new Map();
    /**
     * Session counter to assign unique session indexes
     */
    this._sessionsCount = 0;
    /**
     * Main promise returned from run() method
     */
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
    //todo: maybe remove?
    this._isSplitPossible = true;
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

  _getNextQueue(session) {
    return this._isEnvEnd
      ? this._trySplit(session)
      : this._getNextQueueFromExecutor();
  }

  _getNextQueueFromExecutor() {
    const {queue, isLast} = this._options.getNextQueue();
    if (queue) {
      this._isEnvEnd = isLast;
    } else {
      this._isQueuesEnd = true;
    }
    return queue;
  }

  _trySplit(session) {
    if (this._options.config.splitSuites && this._isSplitPossible) {
      const queue = new Splitter(this._slots, session).getQueue();
      if (queue) {
        return queue;
      } else {
        this._isSplitPossible = false;
      }
    }
    // split not possible, just wait for other sessions to end
  }

  _processNextQueue(session) {
    const queue = this._getNextQueue(session);
    if (queue) {
      return queue.suite.env === session.env
        ? this._runOnExistingSession(session, queue)
        : this._closeSession(session)
          .then(() => this._runOnNewSession(queue));
    } else {
      return this._closeSession(session)
        .then(() => this._onFreeSlot());
    }
  }

  _runOnNewSession(queue) {
    return this._createSession(queue)
      .then(session => this._runOnExistingSession(session, queue));
  }

  _runOnExistingSession(session, queue) {
    this._slots.set(session, queue);
    return queue.run(session.caller)
      .then(() => this._processNextQueue(session));
  }

  _createSession(queue) {
    const session = new Session({
      env: queue.suite.env,
      index: this._sessionsCount,
      reporter: this._options.reporter,
      config: this._options.config,
    });
    this._sessionsCount++;
    this._slots.set(session, queue);
    return session.start()
      .then(() => session);
  }

  _closeSession(session) {
    return session.close()
      .then(() => this._slots.delete(session));
  }

  _onFreeSlot() {
    if (this._slots.size === 0) {
      if (this._isQueuesEnd) {
        this._promised.resolve();
      } else {
        // todo: emit env end
        this._startNextEnv();
      }
    }
  }
};
