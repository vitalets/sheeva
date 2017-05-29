'use strict';

/**
 * Workers manager: keeps workers count under concurrency limit
 */

const {config} = require('../../config');
const {result} = require('../../result');
const reporter = require('../../reporter');
const {WORKER_ADD, WORKER_DELETE} = require('../../events');
const Worker = require('./worker');

module.exports = class Workers {
  /**
   * Constructor
   */
  constructor() {
    this._workers = result.workers;
    this._terminating = false;
    this._onEmpty = () => {};
    this._onFreeWorker = () => {};
    this._onSessionStart = () => {};
    this._onSessionEnd = () => {};
  }

  set onEmpty(handler) {
    this._onEmpty = handler;
  }

  set onFreeWorker(handler) {
    this._onFreeWorker = handler;
  }

  set onSessionStart(handler) {
    this._onSessionStart = handler;
  }

  set onSessionEnd(handler) {
    this._onSessionEnd = handler;
  }

  toArray() {
    return this._workers.toArray();
  }

  fill() {
    while (!this._isConcurrencyReached()) {
      const worker = this._createWorker();
      const queue = this._onFreeWorker(worker);
      if (!queue) {
        break;
      }
    }
  }

  delete(worker) {
    return worker.deleteSession()
      .then(() => this._destroyWorker(worker))
      .then(() => this._terminating ? null : this._checkEmpty());
  }

  /**
   * Terminates all worker sessions and ignore other errors in favor of first runner error
   */
  terminate() {
    this._terminating = true;
    const tasks = this._workers.mapToArray(worker => this.delete(worker).catch(() => {}));
    return Promise.all(tasks);
  }

  getWorkersForTarget(target) {
    return this._workers.toArray()
      .filter(worker => worker.isHoldingTarget(target));
  }

  hasWorkersForTarget(target) {
    for (let worker of this._workers) {
      if (worker.isHoldingTarget(target)) {
        return true;
      }
    }
    return false;
  }

  _isConcurrencyReached() {
    return config.concurrency && this._workers.size === config.concurrency;
  }

  _createWorker() {
    const workerIndex = this._workers.size;
    const worker = new Worker(workerIndex);
    worker.onSessionStart = this._onSessionStart;
    worker.onSessionEnd = this._onSessionEnd;
    this._workers.add(worker);
    reporter.handleEvent(WORKER_ADD, {worker});
    return worker;
  }

  _destroyWorker(worker) {
    this._workers.delete(worker);
    reporter.handleEvent(WORKER_DELETE, {worker});
  }

  _checkEmpty() {
    if (this._workers.size === 0) {
      this._onEmpty();
    }
  }
};
