/**
 * Main class for executing tests.
 * It creates Slots and keep their number under concurrency limit.
 * Each slot execute sessions serially.
 * Session takes Queue and executes it.
 * Queues are spread per available sessions via Queue-picker.
 *
 * @type {Executer}
 */

const utils = require('../utils');
const Queues = require('./queues');
const Slots = require('./slots');
const Emitter = require('./emitter');

module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._envFlatSuites = null;
    this._queues = null;
    this._emitter = null;
    this._slots = null;
    this._promised = new utils.Promised();
  }

  /**
   * Run
   *
   * @param {Map<Env,Array<FlatSuite>>} envFlatSuites
   */
  run(envFlatSuites) {
    this._envFlatSuites = envFlatSuites;
    return this._promised.call(() => {
      this._init();
      this._slots.fill();
    });
  }

  _init() {
    this._initSlots();
    this._initQueues();
    this._initEmitter();
  }

  _initSlots() {
    const handlers = {
      onFreeSlot: slot => this._handleFreeSlot(slot),
      onEmpty: () => this._end(),
      onSessionStart: session => this._emitter.checkEnvStart(session.env),
      onSessionEnd: session => this._emitter.checkEnvEnd(session.env),
    };
    this._slots = new Slots(handlers);
  }

  _initQueues() {
    this._queues = new Queues(this._slots, this._envFlatSuites);
  }

  _initEmitter() {
    this._emitter = new Emitter(this._slots, this._queues, this._envFlatSuites);
  }

  _handleFreeSlot(slot) {
    const queue = this._queues.tryGetNext(slot.session);

    if (queue) {
      slot.run(queue)
        .then(() => this._handleFreeSlot(slot))
        .catch(e => this._terminate(e));
    } else {
      this._slots.remove(slot)
        .catch(e => this._terminate(e));
    }

    return queue;
  }

  _end() {
    this._promised.resolve();
  }

  _terminate(error) {
    this._slots.terminate()
      .then(
        () => this._promised.reject(error),
        () => this._promised.reject(error)
      );
  }
};
