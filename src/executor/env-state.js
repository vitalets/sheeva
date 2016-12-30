/**
 * Env state during execution
 *
 * @type {EnvState}
 */

const Queue = require('./queue');
const Base = require('./base');
const {ENV_START, ENV_END} = require('../events');

const STATUS = {
  CREATED: 'created',
  STARTED: 'started',
  ENDED: 'ended',
};

module.exports = class EnvState extends Base {
  /**
   * Constructor
   *
   * @param {Object} env
   * @param {Array} testsArr
   */
  constructor(env, testsArr) {
    super();
    this._env = env;
    this._queues = testsArr.map(tests => new Queue(tests));
    this._slots = 0;
    this._status = STATUS.CREATED;
    this._splitForNewSession = true;
    this._splitForExistingSession = true;
    this._calcTestsCount();
  }

  get slots() {
    return this._slots;
  }

  isEmpty() {
    return this._testsCount === 0;
  }

  /**
   * Tries to get next queue
   * @param {Object} options
   * @returns {Queue|undefined}
   */
  getNextQueue(options = {}) {
    const queue = this._queues.shift();
    if (queue && options.increaseSlots) {
      this._slots++;
    }
    if (!queue && options.decreaseSlots) {
      this._slots--;
    }
    if (this._status !== STATUS.STARTED) {
      this._status = STATUS.STARTED;
      this._emitEnvStart();
    }
    return queue;
  }

  checkEnd() {
    if (this._slots === 0 && this._queues.length === 0 && this._status === STATUS.STARTED) {
      this._status = STATUS.ENDED;
      this._emitEnvEnd();
    }
  }

  _emitEnvStart() {
    const label = this._config.createEnvLabel(this._env);
    this._emit(ENV_START, {env: this._env, label, testsCount: this._testsCount, queues: this._queues});
  }

  _emitEnvEnd() {
    this._emit(ENV_END, {env: this._env});
  }

  _calcTestsCount() {
    this._testsCount = this._queues.reduce((res, queue) => res + queue.tests.length, 0);
  }
};
