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
const reporter = require('../reporter');
const {ENV_START, ENV_END} = require('../events');

module.exports = class Executer {
  /**
   * Constructor
   */
  constructor() {
    this._queues = null;
    this._slots = null;
    this._startedEnvs = new Set();
    this._promised = new utils.Promised();
  }

  /**
   * Run
   *
   * @param {Map<Env,Array<FlatSuite>>} envFlatSuites
   */
  run(envFlatSuites) {
    return this._promised.call(() => {
      this._initSlots();
      this._initQueues(envFlatSuites);
      this._slots.fill();
    });
  }

  _initSlots() {
    const handlers = {
      onFreeSlot: slot => this._handleFreeSlot(slot),
      onEmpty: () => this._end(),
      onSessionStart: session => this._checkEnvStart(session.env),
      onSessionEnd: session => this._checkEnvEnd(session.env),
    };
    this._slots = new Slots(handlers);
  }

  _initQueues(envFlatSuites) {
    this._queues = new Queues(this._slots, envFlatSuites);
  }

  _handleFreeSlot(slot) {
    const queue = this._queues.tryGetNext(slot.session);

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
    return this._queues.getQueuesForEnv(env).length > 0;
  }

  _hasSlots(env) {
    return this._slots.toArray().some(slot => slot.isHoldingEnv(env));
  }
};
