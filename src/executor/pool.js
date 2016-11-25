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
     * State of each processed env (is last queue reached, is split possible)
     */
    this._envStates = new Map();
    /**
     * Flag showing that there are no more queues so we wait for current sessions to finish
     */
    //this._isQueuesEnd = false;
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
      if (!this._onFreeSlot()) {
        break;
      }
    }
  }

  _hasFreeSlots() {
    return this._slots.size < this._options.config.concurrency;
  }

  _onFreeSlot(queue) {
    queue = queue || this._trySplitForSlot() || this._getNextQueue();
    if (queue) {
      const session = this._createSession(queue.suite.env);
      this._slots.add(session);
      return this._runQueue(session, queue)
        .catch(e => this._promised.reject(e))
    } else {
      this._checkDone();
    }
  }

  _onFreeSession(session) {
    let queue;

    queue = this._trySplitForSession(session);
    if (queue) {
      return this._runQueue(session, queue);
    }

    queue = this._getNextQueue();
    if (queue && queue.suite.env === session.env) {
      return this._runQueue(session, queue);
    }

    return session.close()
      .then(() => {
        this._slots.delete(session);
        this._onFreeSlot(queue);
      });
  }

  _runQueue(session, queue) {
    return session.run(queue)
      .then(() => this._onFreeSession(session));
  }

  _getNextQueue() {
    const {queue, isLast} = this._options.getNextQueue();
    if (queue) {
      this._updateEnvState(queue, isLast);
    }
    return queue;
  }

  _updateEnvState(queue, isLast) {
    const env = queue.suite.env;
    let envState = this._envStates.get(env);
    if (!envState) {
      envState = {
        splitForSession: false,
        splitForSlot: false,
      };
      this._envStates.set(env, envState);
    }
    envState.splitForSession = isLast;
    envState.splitForSlot = isLast;
  }

  _trySplitForSession(session) {
    if (!this._options.config.splitSuites) {
      return;
    }
    const envState = this._envStates.get(session.env);
    if (envState.splitForSession) {
      const queue = this._getSplitter().trySplit({envs: [session.env], isSessionStarted: session.started});
      if (queue) {
        return queue;
      } else {
        envState.splitForSession = false;
        // if split is impossible for running session, it's for sure impossible for new session
        // as it requires time for session start
        envState.splitForSlot = false;
      }
    }
  }

  _trySplitForSlot() {
    if (!this._options.config.splitSuites) {
      return;
    }
    const envs = [];
    this._envStates.forEach((envState, env) => envState.splitForSlot ? envs.push(env) : null);
    const queue = this._getSplitter().trySplit({envs, isSessionStarted: false});
    if (queue) {
      return queue;
    } else {
      envs.forEach(env => this._envStates.get(env).splitForSlot = false);
    }
  }

  _getSplitter() {
    const queues = [];
    this._slots.forEach(session => session.queue ? queues.push(session.queue) : null);
    return new Splitter(queues);
  }

  _createSession(env) {
    return new Session({
      env,
      index: ++this._sessionsCount,
      reporter: this._options.reporter,
      config: this._options.config,
    });
  }

  _checkDone() {
    if (this._slots.size === 0) {
      this._promised.resolve();
    }
  }
};
