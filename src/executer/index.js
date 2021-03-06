'use strict';

/**
 * Main class for executing tests:
 *
 * - Executor creates workers and keeps their count below concurrency limit.
 * - Workers are working concurrently.
 * - Each worker executes sessions serially.
 * - Session takes queue after queue from taker and executes it.
 * - Picker returns whole queues or tries split when reasonable.
 * - Queue moves internal cursor test by test and executes them via caller.
 * - Caller calls test function with needed hooks.
 */

const {config} = require('../configurator');
const state = require('../state');
const reporter = require('../reporter');
const utils = require('../utils');
const Filter = require('./filter');
const QueuePicker = require('./queue-picker');
const Workers = require('./workers');
const HookFn = require('./caller/hooks/hook-fn');
const TestCaller = require('./caller/test');

const {
  EXECUTER_START,
  EXECUTER_END,
  TARGET_START,
  TARGET_END,
} = require('../events');

const STATUS = {
  READY: 0,
  EXECUTING: 1,
  TERMINATING: 2,
  ENDED: 3,
};

module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._executionPerTarget = state.executionPerTarget;
    this._workers = null;
    this._picker = null;
    this._promised = new utils.Promised();
    this._status = STATUS.READY;
  }

  get isExecuting() {
    return this._status === STATUS.EXECUTING;
  }

  /**
   * Run
   *
   * @param {Locator} [locator]
   */
  run(locator) {
    this._status = STATUS.EXECUTING;
    return this._promised.call(() => {
      new Filter(locator).apply();
      reporter.handleEvent(EXECUTER_START);
      this._workers = new Workers();
      this._picker = new QueuePicker(this._workers);
      this._startWorkers();
    });
  }

  /**
   * Terminate tests running.
   */
  terminate(error) {
    this._status = STATUS.TERMINATING;
    return this._workers.terminate()
    // todo: catch and emit extra error
      .finally(() => this._end(error));
  }

  _startWorkers() {
    while (!this._isConcurrencyReached()) {
      const queue = this._picker.getNextQueue();
      if (queue) {
        this._addWorker(queue)
          .then(worker => this._runQueue(worker, queue))
          .catch(e => this.terminate(e));
      } else {
        this._checkEnd();
        break;
      }
    }
  }

  _handleFreeWorker(worker) {
    const queue = this._picker.getNextQueue(worker.session);
    if (queue) {
      this._runQueue(worker, queue);
    } else {
      this._deleteWorker(worker);
    }
  }

  _addWorker(queue) {
    return this._workers.add(queue)
      .then(worker => {
        worker.onSessionStart = session => this._tryEmitTargetStart(session.target);
        worker.onSessionEnd = session => this._tryEmitTargetEnd(session.target);
        return worker;
      });
  }

  _deleteWorker(worker) {
    this._workers.delete(worker)
      .then(() => this._checkEnd())
      .catch(e => this.terminate(e));
  }

  _runQueue(worker, queue) {
    worker.run(queue)
      .then(() => this._handleFreeWorker(worker))
      .catch(e => this.terminate(e));
  }

  _isConcurrencyReached() {
    return config.concurrency && this._workers.size === config.concurrency;
  }

  _checkEnd() {
    if (this._workers.size === 0) {
      this._end();
    }
  }

  _end(error) {
    this._status = STATUS.ENDED;
    reporter.handleEvent(EXECUTER_END, {error});
    // pass through only system errors, test and hook errors are just reported, but don't reject main promise
    const isReject = error && !TestCaller.isTestError(error) && !HookFn.isHookError(error);
    if (isReject) {
      this._promised.reject(error);
    } else {
      this._promised.resolve();
    }
  }

  _tryEmitTargetStart(target) {
    const execution = this._executionPerTarget.get(target);
    if (!execution.started) {
      execution.started = true;
      reporter.handleEvent(TARGET_START, {target});
    }
  }

  _tryEmitTargetEnd(target) {
    if (this._isTargetFinished(target)) {
      const execution = this._executionPerTarget.get(target);
      if (!execution.ended) {
        execution.ended = true;
        reporter.handleEvent(TARGET_END, {target});
      }
    }
  }

  _isTargetFinished(target) {
    return !this._picker.hasPendingTestsForTarget(target) && !this._workers.hasWorkersForTarget(target);
  }
};
