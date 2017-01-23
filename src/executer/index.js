/**
 * Main class for executing tests.
 * It creates Slots and keep their number under concurrency limit.
 * Each slot execute sessions serially.
 *
 * @type {Executer}
 */

const utils = require('../utils');
const Base = require('../base');
const QueuePicker = require('./queue-picker');
const Slot = require('./slot');
const EnvState = require('./env-state');
const SessionManager = require('./session-manager');

module.exports = class Executer extends Base {
  /**
   * Constructor
   */
  constructor() {
    super();
    this._slots = new Set();
    this._state = new Map();
    this._queuePicker = null;
    this._sessionManager = null;
    this._promised = new utils.Promised();
  }

  /**
   * Run
   *
   * @param {Map} envFlatSuites
   */
  run(envFlatSuites) {
    return this._promised.call(() => {
      this._initState(envFlatSuites);
      this._initQueuePicker();
      this._initSessionManager();
      this._fillSlots();
    });
  }

  _initState(envFlatSuites) {
    envFlatSuites.forEach((flatSuites, env) => {
      const envState = new EnvState(env, flatSuites).setBaseProps(this);
      if (!envState.isEmpty()) {
        this._state.set(env, envState);
      }
    });
  }

  _initQueuePicker() {
    this._queuePicker = new QueuePicker(this._state);
  }

  _initSessionManager() {
    this._sessionManager = new SessionManager(this._state).setBaseProps(this);
  }

  /**
   * Run parallel sessions in limited slots
   */
  _fillSlots() {
    while (this._hasFreeSlots()) {
      const slot = this._createSlot();
      const queue = this._handleFreeSlot(slot);
      if (!queue) {
        break;
      }
    }
  }

  _hasFreeSlots() {
    return !this._config.concurrency || this._slots.size < this._config.concurrency;
  }

  _createSlot() {
    const slot = new Slot(this._sessionManager);
    this._slots.add(slot);
    return slot;
  }

  _deleteSlot(slot) {
    return slot.end()
      .then(() => {
        this._slots.delete(slot);
        this._checkDone();
      })
  }

  _handleFreeSlot(slot) {
    const queue = this._queuePicker.getNextQueue(slot.session);

    if (queue) {
      slot.run(queue)
        .then(() => this._handleFreeSlot(slot))
        .catch(e => this._terminate(e));
    } else {
      this._deleteSlot(slot)
        .catch(e => this._terminate(e));
    }

    return queue;
  }
  //
  // _handleFreeSession(session) {
  //   let queue;
  //
  //   if (this._splitter) {
  //     queue = this._splitter.trySplitForSession(session);
  //     if (queue) {
  //       return this._runOnExistingSession(session, queue);
  //     }
  //   }
  //
  //   queue = this._getNextQueue();
  //
  //   const queue = this._queuePicker.getNextQueue();
  //
  //   if (queue) {
  //     const canRunOnExistingSession = !this._config.newSessionPerFile && queue.suite.env === session.env;
  //     if (canRunOnExistingSession) {
  //       return this._runOnExistingSession(session, queue);
  //     } else {
  //       return session.end()
  //         .then(() => {
  //           this._slots.delete(session);
  //           this._checkEnvDone(session.env);
  //           this._handleFreeSlot(queue);
  //         });
  //     }
  //   } else {
  //     return session.end()
  //       .then(() => {
  //         this._slots.delete(session);
  //         this._checkEnvDone(session.env);
  //       });
  //   }
  // }

  // _runOnEmptySlot(queue) {
  //   const session = this._createSession(queue.suite.env);
  //   this._slots.add(session);
  //   return this._runOnExistingSession(session, queue)
  //     .catch(e => this._terminate(e));
  // }

  // _runOnNewSession(queue) {
  //   const session = this._createSession(queue.suite.env);
  //   this._slots.add(session);
  //   return this._runOnExistingSession(session, queue)
  //     .catch(e => this._terminate(e));
  // }
  //
  // _runOnExistingSession(session, queue) {
  //   return session.run(queue)
  //     .then(() => this._handleFreeSession(session));
  // }

  // _getNextQueue() {
  //   const {queue, isLastQueueInEnv} = this._options.getNextQueue();
  //   if (queue) {
  //     this._updateEnvState(queue, isLastQueueInEnv);
  //   } else {
  //     this._noMoreQueues = true;
  //   }
  //   return queue;
  // }
  //
  // _createSession(env) {
  //   return new Session({
  //     env,
  //     index: ++this._sessionsCount,
  //     reporter: this._options.reporter,
  //     config: this._options.config,
  //   });
  // }

  _terminate(error) {
    this._endAllSlots()
      .then(
        () => this._promised.reject(error),
        () => this._promised.reject(error)
      );
  }

  /**
   * Closes all sessions and ignore other errors in favor of first runner error
   */
  _endAllSlots() {
    const tasks = [];
    this._slots.forEach(slot => {
      // use empty catch() to ignore error while closing slot session to keep original error
      const task = slot.end().catch();
      tasks.push(task);
    });
    return Promise.all(tasks);
  }

  // _checkEnvDone(env) {
  //   for (let session of this._slots.values()) {
  //     if (session.env === env) {
  //       return false;
  //     }
  //   }
  //   const envState = this._envStates.get(env);
  //   envState.ended = true;
  //   this._options.reporter.handleEvent(ENV_END, {env});
  // }
  //
  _checkDone() {
    if (this._slots.size === 0) {
      this._promised.resolve();
    }
  }
};
