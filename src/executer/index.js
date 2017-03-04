/**
 * Main class for executing tests:
 *
 * - Executor creates slots and keeps their count below concurrency limit.
 * - Slots are working concurrently.
 * - Each slot executes sessions serially.
 * - Session takes queue after queue from picker and executes it.
 * - Picker returns whole queues or tries split when reasonable.
 * - Queue moves internal cursor test by test and executes them via caller.
 * - Caller calls test function with needed hooks.
 *
 * @type {Executer}
 */

const utils = require('../utils');
const Picker = require('./picker');
const Slots = require('./slots');
const Sessions = require('./sessions');
const EnvEmitter = require('./env-emitter');
const {errors} = require('./caller');

const Executer = module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._sessions = new Sessions();
    this._slots = new Slots(this._sessions);
    this._picker = null;
    this._promised = new utils.Promised();
    this._setSlotsHandlers();
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
      this._slots.fill();
    });
  }

  _setSlotsHandlers() {
    this._slots.onFreeSlot = slot => this._handleFreeSlot(slot);
    this._slots.onEmpty = () => this._end();
  }

  _createPicker(envFlatSuites) {
    this._picker = new Picker(this._slots, envFlatSuites);
  }

  _createEnvEmitter() {
    new EnvEmitter(this._slots, this._picker);
  }

  _handleFreeSlot(slot) {
    const queue = this._picker.pickNextQueue(slot.session);

    if (queue) {
      slot.run(queue)
        .then(() => this._handleFreeSlot(slot))
        .catch(e => this._terminate(e));
    } else {
      this._slots.delete(slot)
        .catch(e => this._terminate(e));
    }

    return queue;
  }

  _end() {
    this._promised.resolve();
  }

  _terminate(error) {
    this._slots.terminate()
      .finally(() => this._promised.reject(error));
  }
};

Executer.errors = errors;
