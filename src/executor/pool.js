/**
 * Controls concurrency pool of sessions
 * currently it does not start next env until current env is fully processed
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
    return this._slots.size < this._options.config.concurrency;
  }

  _handleFreeSlot(queue) {
    queue = queue || this._trySplitForSlot() || this._getNextQueue();
    if (queue) {
      return this._runOnNewSession(queue)
    } else {
      this._checkDone();
    }
  }

  _handleFreeSession(session) {
    let queue;

    queue = this._trySplitForSession(session);
    if (queue) {
      return this._runOnExistingSession(session, queue);
    }

    queue = this._getNextQueue();
    if (queue && queue.suite.env === session.env) {
      return this._runOnExistingSession(session, queue);
    }

    return session.close()
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
      .catch(e => this._promised.reject(e))
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

  /**
   * Tries split running sessions for particular free session (same env)
   *
   * @param {Session} session
   */
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

  /**
   * 1. Finds all envs that reached end and can be splitted.
   * 2. Finds the worst session and and tries split it to empty slot.
   */
  _trySplitForSlot() {
    if (!this._options.config.splitSuites) {
      return;
    }
    const envs = [];
    this._envStates.forEach((envState, env) => envState.splitForSlot ? envs.push(env) : null);
    if (!envs.length) {
      return;
    }
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
