/**
 * Sheeva entry point
 */

require('promise.prototype.finally').shim();

const utils = require('./utils');
const configurator = require('./configurator');
const reporter = require('./reporter');
const Reader = require('./reader');
const Transformer = require('./transformer');
const Executer = require('./executer');
const {RUNNER_INIT, RUNNER_START, RUNNER_END} = require('./events');

const config = configurator.config;

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Object} rawConfig
   */
  constructor(rawConfig) {
    this._rawConfig = rawConfig;
    this._reader = new Reader();
    this._transformer = new Transformer();
    this._executer = new Executer();
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
      .then(() => this._readFiles())
      .then(() => this._transform())
      .then(() => this._start())
      .then(() => this._execute())
      .catch(e => this._storeRunnerError(e))
      .finally(() => this._end())
      .then(() => this._getResult())
  }

  _init() {
    configurator.init(this._rawConfig);
    reporter.init();
    this._emitInit();
  }

  _readFiles() {
    return this._reader.read();
  }

  _transform() {
    this._transformer.transform(this._reader.result);
  }

  _start() {
    this._emitStart();
    return utils.thenCall(() => config.startRunner(config));
  }

  _execute() {
    return this._executer.run(this._transformer.result);
  }

  /**
   * Store runner error.
   * When config.breakOnError is enabled, errors from tests/hooks are also come here,
   * but we filter them as they should be already reported
   *
   * @param {Error} error
   */
  _storeRunnerError(error) {
    const isErrorInHookOrTest = config.breakOnError && (error.suite || error.test);
    if (!isErrorInHookOrTest && !this._runnerError) {
      this._runnerError = error || new Error('Empty rejection');
    }
  }

  _end() {
    return Promise.resolve()
      .then(() => config.endRunner(config))
      .catch(e => this._storeRunnerError(e))
      .finally(() => this._emitEnd())
      .finally(() => reporter.stopListen())
      .catch(e => this._storeRunnerError(e))
  }

  _getResult() {
    return this._runnerError ? Promise.reject(this._runnerError) : reporter.getResult();
  }

  _emitInit() {
    const data = {config};
    reporter.handleEvent(RUNNER_INIT, data);
  }

  _emitStart() {
    const data = {
      config,
      files: this._reader.files,
      only: this._transformer.meta.only,
      skip: this._transformer.meta.skip,
    };
    reporter.handleEvent(RUNNER_START, data);
  }

  _emitEnd() {
    const data = {error: this._runnerError};
    reporter.handleEvent(RUNNER_END, data);
  }
};

