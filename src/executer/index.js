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

const utils = require('../utils');
const Picker = require('./picker');
const Workers = require('./workers');
const Sessions = require('./sessions');
const EnvEmitter = require('./env-emitter');
const {errors} = require('./caller');

const Executer = module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._sessions = new Sessions();
    this._workers = new Workers(this._sessions);
    this._picker = null;
    this._promised = new utils.Promised();
    this._setWorkersHandlers();
  }

  /**
   * Run
   *
   * @param {Map<Env,Array<FlatSuite>>} envFlatSuites
   */
  run(envFlatSuites) {
    return this._promised.call(() => {
      this._createPicker(envFlatSuites);
      this._createEnvEmitter();
      this._workers.fill();
    });
  }

  _setWorkersHandlers() {
    this._workers.onFreeWorker = worker => this._handleFreeWorker(worker);
    this._workers.onEmpty = () => this._end();
  }

  _createPicker(envFlatSuites) {
    this._picker = new Picker(this._workers, envFlatSuites);
  }

  _createEnvEmitter() {
    new EnvEmitter(this._workers, this._picker);
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
};

Executer.errors = errors;
