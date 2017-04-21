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
 *
 * @type {Executer}
 */

const {result} = require('../result');
const reporter = require('../reporter');
const utils = require('../utils');
const {ENV_START, ENV_END} = require('../events');
const Picker = require('./picker');
const Workers = require('./workers');
const {errors} = require('./caller');

const Executer = module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._executionPerEnv = result.executionPerEnv;
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
    this._workers.onSessionStart = session => this._tryEmitEnvStart(session.env);
    this._workers.onSessionEnd = session => this._tryEmitEnvEnd(session.env);
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

  _terminate(error) {
    this._workers.terminate()
      .finally(() => this._promised.reject(error));
  }

  _tryEmitEnvStart(env) {
    const execution = this._executionPerEnv.get(env);
    if (!execution.started) {
      execution.started = true;
      reporter.handleEvent(ENV_START, {env});
    }
  }

  _tryEmitEnvEnd(env) {
    if (this._isFinishedEnv(env)) {
      this._executionPerEnv.get(env).ended = true;
      reporter.handleEvent(ENV_END, {env});
    }
  }

  _isFinishedEnv(env) {
    return !this._picker.getRemainingQueues(env).length && !this._workers.hasWorkersForEnv(env);
  }
};

Executer.errors = errors;
