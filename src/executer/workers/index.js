'use strict';

/**
 * Workers manager: keeps workers count under concurrency limit
 */

const state = require('../../state');
const reporter = require('../../reporter');
const {WORKER_ADD, WORKER_DELETE} = require('../../events');
const Worker = require('./worker');

module.exports = class Workers {
  /**
   * Constructor
   */
  constructor() {
    this._workers = state.workers;
  }

  get size() {
    return this._workers.size;
  }

  toArray() {
    return this._workers.toArray();
  }

  /**
   * Adds new worker to pool
   *
   * @param {Queue} queue initial queue that worker will run after creation
   * @returns {Promise}
   */
  add(queue) {
    const workerIndex = this._workers.size;
    const worker = new Worker(workerIndex, queue);
    this._workers.add(worker);
    reporter.handleEvent(WORKER_ADD, {worker});
    return worker.start()
      .then(() => worker);
  }

  /**
   * Deletes single worker and session
   *
   * @param {Worker} worker
   * @returns {Promise}
   */
  delete(worker) {
    return Promise.resolve()
      .then(() => worker.deleteSession())
      .finally(() => this._deleteWorker(worker));
  }

  /**
   * Terminates all worker sessions and ignore other errors in favor of first runner error
   */
  terminate() {
    const tasks = this._workers.mapToArray(worker => {
      return this.delete(worker).catch(() => {});
    });
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

  _deleteWorker(worker) {
    return worker.end()
      .finally(() => {
        this._workers.delete(worker);
        reporter.handleEvent(WORKER_DELETE, {worker});
      });
  }
};
