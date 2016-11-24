/**
 * Controls concurrency pool of sessions
 * currently it does not start next env until current env is fully processed
 */

const Promised = require('../utils/promised');
const Worker = require('./worker');
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
     * Flag showing that suite splitting is still possible,
     * otherwise other sessions will not even try
     */
    //this._isSplitPossible = false;
    /**
     * Flag showing that there are no more queues so we wait for current sessions to finish
     */
    //this._isQueuesEnd = false;
    /**
     * Map of slots for workers, limited by concurrency
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
   * Run parallel workers in limited slots
   */
  _fillSlots() {
    while (this._hasFreeSlots()) {
      const queue = this._getQueue();
      if (queue) {
        const worker = new Worker({
          reporter: this._options.reporter,
          config: this._options.config,
        });
        this._slots.add(worker);
        this._onFreeWorker(worker, queue)
          .catch(e => this._promised.reject(e));
      } else {
        this._checkDone();
        break;
      }
    }
  }

  _hasFreeSlots() {
    return this._slots.size < this._options.config.concurrency;
  }

  _onFreeWorker(worker, queue) {
    queue = queue || this._getQueue(worker);
    if (queue) {
      return worker.run(queue)
        .then(() => this._onFreeWorker(worker));
    } else {
      return worker.close()
        .then(() => {
          this._slots.delete(worker);
          this._checkDone();
        });
    }
  }

  _getQueue(worker) {
    let splittedQueue;
    if (this._options.config.splitSuites) {
      const session = worker && worker.session;
      splittedQueue = session
        ? this._trySplitForSession(session)
        : this._trySplitForEnvs();
    }
    return splittedQueue || this._getNextQueue();
  }

  _trySplitForSession(session) {
    const envState = this._envStates.get(session.env);
    if (envState.isLastQueue) {
      return this._getSplitter().splitForSession(session);
    }
  }

  _trySplitForEnvs() {
    const envs = [];
    // todo: envState.running ?
    this._envStates.forEach((envState, env) => envState.isLastQueue ? envs.push(env) : null);
    return this._getSplitter().splitForEnvs(envs);
  }

  _getSplitter() {
    const queues = [];
    this._slots.forEach(worker => worker.queue ? queues.push(worker.queue) : null);
    return new Splitter(queues);
  }

  _getNextQueue() {
    const {queue, isLastQueue} = this._options.getNextQueue();
    if (queue) {
      this._updateEnvStates(queue, isLastQueue);
    }
    return queue;
  }

  _updateEnvStates(queue, isLastQueue) {
    const env = queue.suite.env;
    const envState = this._envStates.get(env);
    if (envState) {
      envState.isLastQueue = isLastQueue;
    } else {
      this._envStates.set(env, {isLastQueue});
    }
  }

  _checkDone() {
    if (this._slots.size === 0) {
      this._promised.resolve();
    }
  }
};
