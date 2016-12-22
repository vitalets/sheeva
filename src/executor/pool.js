/**
 * Controls concurrency pool of sessions: create and remove sessions for queues
 *
 * @type {Pool}
 */

const Promised = require('../utils/promised');
const Session = require('./session');
const Splitter = require('./splitter');
const {ENV_END} = require('../events');

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
     * State of each processed env (is last queue reached, is split possible)
     */
    this._envStates = new Map();
    /**
     * Splitter
     */
    this._splitter = new Splitter(this, this._options.config.splitSuites);
    /**
     * Flag showing that there are no more queues so we wait for current sessions to finish
     */
    this._noMoreQueues = false;
    /**
     * Slots for running sessions, limited by concurrency
     */
    this._slots = new Set();
    /**
     * Session counter to assign unique session indexes
     */
    this._sessionsCount = 0;
    /**
     * Main promise returned from run() method
     */
    this._promised = new Promised();
  }

  get envStates() {
    return this._envStates;
  }

  get slots() {
    return this._slots;
  }

  /**
   * Run
   */
  run() {
    return this._promised.call(() => this._fillSlots());
  }

  /**
   * Run parallel sessions in limited slots
   */
  _fillSlots() {
    while (this._hasFreeSlots()) {
      const job = this._handleFreeSlot();
      if (!job) {
        break;
      }
    }
  }

  _hasFreeSlots() {
    return !this._options.config.concurrency || this._slots.size < this._options.config.concurrency;
  }

  _handleFreeSlot(queue) {
    queue = queue || this._splitter.trySplitForSlot() || this._getNextQueue();
    if (queue) {
      return this._runOnNewSession(queue)
    } else {
      this._checkDone();
    }
  }

  _handleFreeSession(session) {
    let queue;

    queue = this._splitter.trySplitForSession(session);
    if (queue) {
      return this._runOnExistingSession(session, queue);
    }

    queue = this._getNextQueue();
    if (queue && queue.suite.env === session.env) {
      return this._runOnExistingSession(session, queue);
    }

    return session.end()
      .then(() => {
        this._slots.delete(session);
        this._checkEnvDone(session.env);
        this._handleFreeSlot(queue);
      });
  }

  _runOnNewSession(queue) {
    const session = this._createSession(queue.suite.env);
    this._slots.add(session);
    return this._runOnExistingSession(session, queue)
      .catch(e => this._terminate(e));
  }

  _runOnExistingSession(session, queue) {
    return session.run(queue)
      .then(() => this._handleFreeSession(session));
  }

  _getNextQueue() {
    const {queue, isLastQueueInEnv} = this._options.getNextQueue();
    if (queue) {
      this._updateEnvState(queue, isLastQueueInEnv);
    } else {
      this._noMoreQueues = true;
    }
    return queue;
  }

  _updateEnvState(queue, isLastQueueInEnv) {
    const env = queue.suite.env;
    let envState = this._envStates.get(env);
    if (!envState) {
      envState = {
        ended: false,
      };
      this._envStates.set(env, envState);
    }
    if (isLastQueueInEnv) {
      Object.assign(envState, {
        lastQueueReached: true,
        splitForSession: true,
        splitForSlot: true,
      });
    }
  }

  _createSession(env) {
    return new Session({
      env,
      index: ++this._sessionsCount,
      reporter: this._options.reporter,
      config: this._options.config,
    });
  }

  _terminate(error) {
    return this._closeAllSessions()
      .then(
        () => this._promised.reject(error),
        () => this._promised.reject(error)
      );
  }

  /**
   * Closes all sessions and ignore other errors in favor of first runner error
   */
  _closeAllSessions() {
    const tasks = [];
    this._slots.forEach(session => {
      // ignore error while closing session to keep original error
      // try close all sessions even if they were not started for better clean up
      const task = session.end().catch();
      tasks.push(task);
    });
    return Promise.all(tasks);
  }

  _checkEnvDone(env) {
    for (let session of this._slots.values()) {
      if (session.env === env) {
        return false;
      }
    }
    const envState = this._envStates.get(env);
    envState.ended = true;
    this._options.reporter.handleEvent(ENV_END, {env});
  }

  _checkDone() {
    if (this._slots.size === 0) {
      if (this._noMoreQueues) {
        this._promised.resolve();
      } else {

      }
    }
  }
};
