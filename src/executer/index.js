/**
 * Main class for executing tests:
 *
 * - Executor creates workers and keeps their count below concurrency limit.
 * - Workers are working concurrently.
 * - Each worker executes sessions serially.
 * - Session takes queue after queue from picker and executes it.
 * - Picker returns whole queues or tries split when reasonable.
 * - Queue moves internal cursor test by test and executes them via caller.
 * - Caller calls test function with needed hooks.
 */

const {result} = require('../result');
const reporter = require('../reporter');
const utils = require('../utils');
const {TARGET_START, TARGET_END} = require('../events');
const Picker = require('./picker');
const Workers = require('./workers');
const HookFn = require('./caller/hooks/hook-fn');
const TestCaller = require('./caller/test');

module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._executionPerTarget = result.executionPerTarget;
    this._workers = null;
    this._picker = null;
    this._promised = new utils.Promised();
  }

  /**
   * Run
   */
  run() {
    return this._promised.call(() => {
      this._workers = new Workers();
      this._picker = new Picker(this._workers);
      this._setWorkersHandlers();
      this._workers.fill();
    });
  }

  _setWorkersHandlers() {
    this._workers.onFreeWorker = worker => this._handleFreeWorker(worker);
    this._workers.onEmpty = () => this._end();
    this._workers.onSessionStart = session => this._tryEmitTargetStart(session.target);
    this._workers.onSessionEnd = session => this._tryEmitTargetEnd(session.target);
  }

  _handleFreeWorker(worker) {
    const queue = this._picker.pickNextQueue(worker.session);

    if (queue) {
      worker.run(queue)
        .then(() => this._handleFreeWorker(worker))
        .catch(e => this._terminate(e));
    } else {
      this._workers.delete(worker)
        .catch(e => this._terminate(e));
    }

    return queue;
  }

  _end() {
    this._promised.resolve();
  }

  /**
   * Pass through only system errors - in that case runner rejects
   */
  _terminate(error) {
    this._workers.terminate()
      // todo: catch and emit extra error
      .finally(() => {
          return HookFn.isHookError(error) || TestCaller.isTestError(error)
            ? this._promised.resolve()
            : this._promised.reject(error);
      });
  }

  _tryEmitTargetStart(target) {
    const execution = this._executionPerTarget.get(target);
    if (!execution.started) {
      execution.started = true;
      reporter.handleEvent(TARGET_START, {target});
    }
  }

  _tryEmitTargetEnd(target) {
    if (!this._hasPendingJobs(target) && !this._executionPerTarget.get(target).ended) {
      this._executionPerTarget.get(target).ended = true;
      reporter.handleEvent(TARGET_END, {target});
    }
  }

  _hasPendingJobs(target) {
    return this._picker.getRemainingQueues(target).length || this._workers.hasWorkersForTarget(target);
  }
};
