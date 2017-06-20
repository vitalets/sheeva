'use strict';

/**
 * Worker: executes sessions serially.
 */

const {config} = require('../../configurator');
const Session = require('../session');

module.exports = class Worker {
  /**
   * Constructor
   *
   * @param {Number} index
   * @param {Queue} queue initial queue that worker will run after creation
   */
  constructor(index, queue) {
    this._index = index;
    this._queue = queue;
    this._session = null;
    this._onSessionStart = () => {};
    this._onSessionEnd = () => {};
  }

  get index() {
    return this._index;
  }

  get session() {
    return this._session;
  }

  get queue() {
    return this._queue;
  }

  set onSessionStart(handler) {
    this._onSessionStart = handler;
  }

  set onSessionEnd(handler) {
    this._onSessionEnd = handler;
  }

  start() {
    return Promise.resolve()
      .then(() => config.startWorker(this));
  }

  end() {
    return Promise.resolve()
      .then(() => config.endWorker(this));
  }

  run(queue) {
    this._queue = queue;
    return Promise.resolve()
      .then(() => this._needNewSession() ? this._reCreateSession() : null)
      .then(() => config.executeWorkerJob(this))
      .finally(() => this._queue = null);
  }

  deleteSession() {
    if (this._session) {
      const session = this._session;
      return this._session.end()
        .finally(() => this._session = null)
        .then(() => this._onSessionEnd(session));
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Checks that worker is holding target.
   * Actually, worker can hold two targets simultaneously when queue is assigned,
   * but previous session is still ending
   *
   * @returns {Boolean}
   */
  isHoldingTarget(target) {
    return [
      this._session && this._session.target === target,
      this._queue && this._queue.target === target,
    ].some(Boolean);
  }

  _reCreateSession() {
    return Promise.resolve()
      .then(() => this.deleteSession())
      .then(() => this._createSession());
  }

  _createSession() {
    this._session = new Session(this, this._queue.target);
    this._onSessionStart(this._session);
    return this._session.start();
  }

  _needNewSession() {
    return !this._session || config.newSessionPerFile || this._session.target !== this._queue.target;
  }
};
