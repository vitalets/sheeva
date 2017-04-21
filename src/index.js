/**
 * Sheeva entry point
 */

require('promise.prototype.finally').shim();

const utils = require('./utils');
const configInstance = require('./config');
const reporter = require('./reporter');
const resultInstance = require('./result');
const Reader = require('./reader');
const transform = require('./transformer');
const Executer = require('./executer');
const {RUNNER_INIT, RUNNER_START, RUNNER_END} = require('./events');

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Object} rawConfig
   */
  constructor(rawConfig) {
    this._rawConfig = rawConfig;
    this._runnerError = null;
  }

  /**
   * Run tests execution
   *
   * @returns {Promise}
   */
  run() {
    return Promise.resolve()
      .then(() => this._init())
      .then(() => new Reader().read())
      .then(() => transform())
      .then(() => this._start())
      .then(() => new Executer().run())
      .catch(e => this._storeRunnerError(e))
      .finally(() => this._end())
      .then(() => this._getResult());
  }

  _init() {
    configInstance.init(this._rawConfig);
    resultInstance.init();
    reporter.init();
    reporter.handleEvent(RUNNER_INIT);
  }

  _start() {
    const {config} = configInstance;
    reporter.handleEvent(RUNNER_START);
    return utils.thenCall(() => config.startRunner(config));
  }

  _end() {
    const {config} = configInstance;
    return Promise.resolve()
      .then(() => config.endRunner(config))
      .catch(e => this._storeRunnerError(e))
      .finally(() => reporter.handleEvent(RUNNER_END))
      .finally(() => reporter.stopListen())
      .catch(e => this._storeRunnerError(e));
  }

  /**
   * Store runner error.
   * When config.breakOnError is enabled, errors from tests/hooks are also come here,
   * but we filter them as they should be already reported
   *
   * @param {Error} error
   */
  _storeRunnerError(error) {
    const {config} = configInstance;
    if (config.breakOnError && Executer.errors.isTestOrHookError(error)) {
      return;
    }
    if (!this._runnerError) {
      this._runnerError = error || new Error('Empty rejection');
    }
  }

  _getResult() {
    return this._runnerError ? Promise.reject(this._runnerError) : resultInstance.result;
  }
};

