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
const reporter = require('../reporter');
const {ENV_START, ENV_END} = require('../events');
const Picker = require('./picker');
const Slots = require('./slots');
const Sessions = require('./Sessions');
const {errors} = require('./caller');

const Executer = module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._sessions = new Sessions();
    this._slots = new Slots(this._sessions);
    this._picker = null;
    this._startedEnvs = new Set();
    this._promised = new utils.Promised();
    this._initSessions();
    this._initSlots();
  }

  /**
   * Run
   *
   * @param {Map<Env,Array<FlatSuite>>} envFlatSuites
   */
  run(envFlatSuites) {
    return this._promised.call(() => {
      this._initPicker(envFlatSuites);
      this._slots.fill();
    });
  }

  _initSessions() {
    this._sessions.onSessionStart = session => this._checkEnvStart(session.env);
    this._sessions.onSessionEnd = session => this._checkEnvEnd(session.env);
  }

  _initSlots() {
    this._slots.onFreeSlot = slot => this._handleFreeSlot(slot);
    this._slots.onEmpty = () => this._end();
  }

  _initPicker(envFlatSuites) {
    this._picker = new Picker(this._slots, envFlatSuites);
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
      .finally(() => this._promised.reject(error))
  }

  _checkEnvStart(env) {
    if (!this._startedEnvs.has(env)) {
      this._startedEnvs.add(env);
      reporter.handleEvent(ENV_START, {env});
    }
  }

  _checkEnvEnd(env) {
    if (!this._hasQueues(env) && !this._hasSlots(env)) {
      reporter.handleEvent(ENV_END, {env});
    }
  }

  _hasQueues(env) {
    return this._picker.getRemainingQueues(env).length > 0;
  }

  _hasSlots(env) {
    return this._slots.toArray().some(slot => slot.isHoldingEnv(env));
  }
};

Executer.errors = errors;
