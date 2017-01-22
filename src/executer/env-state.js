/**
 * Env state during execution
 *
 * @type {EnvState}
 */

const Base = require('../base');
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
   * @param {Array<FlatSuite>} flatSuites
   */
  constructor(env, flatSuites) {
    super();
    this._env = env;
    this._flatSuites = flatSuites;
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
   * Tries to get next flat suite
   *
   * @param {Object} options
   * @returns {FlatSuite|undefined}
   */
  getNextSuite(options = {}) {
    const flatSuite = this._flatSuites.shift();
    if (flatSuite && options.increaseSlots) {
      this._slots++;
    }
    if (!flatSuite && options.decreaseSlots) {
      this._slots--;
    }
    if (this._status !== STATUS.STARTED) {
      this._status = STATUS.STARTED;
      this._emitEnvStart();
    }
    return flatSuite;
  }

  checkEnd() {
    if (this._slots === 0 && this._flatSuites.length === 0 && this._status === STATUS.STARTED) {
      this._status = STATUS.ENDED;
      this._emitEnvEnd();
    }
  }

  _emitEnvStart() {
    // todo: env label already created earlier in src/index
    const label = this._config.createEnvLabel(this._env);
    this._emit(ENV_START, {env: this._env, label, testsCount: this._testsCount});
  }

  _emitEnvEnd() {
    this._emit(ENV_END, {env: this._env});
  }

  _calcTestsCount() {
    this._testsCount = this._flatSuites.reduce((res, flatSuite) => res + flatSuite.tests.length, 0);
  }
};
