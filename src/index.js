/**
 * Sheeva
 */

require('promise.prototype.finally').shim();

const utils = require('./utils');
const configurator = require('./configurator');
const reporter = require('./reporter');
const Reader = require('./reader');
const Filter = require('./filter');
const Flattener = require('./flattener');
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
    this._filter = new Filter();
    this._flattener = new Flattener();
    this._executer = new Executer();
    this._error = null;
  }

  run() {
    return Promise.resolve()
      .then(() => this._init())
      .then(() => this._readFiles())
      .then(() => this._applyFilter())
      .then(() => this._applyFlatten())
      .then(() => this._start())
      .then(() => this._execute())
      .catch(error => this._storeError(error))
      .finally(() => this._end())
      .then(() => this._getResult())
  }

  getReporter(index) {
    return reporter.get(index);
  }

  getConfig() {
    return config;
  }

  _init() {
    configurator.init(this._rawConfig);
    reporter.init();
    this._emitInit();
  }

  _readFiles() {
    return this._reader.read();
  }

  _applyFilter() {
    return this._filter.run(this._reader.data);
  }

  _applyFlatten() {
    return this._flattener.run(this._filter.envData);
  }

  _execute() {
    return this._executer.run(this._flattener.envFlatSuites);
  }

  /**
   * Store error if it is not stored yet
   * (because first error seems to be more important)
   *
   * @param {*} error
   */
  _storeError(error) {
    if (!this._error) {
      this._error = error || new Error('Empty rejection');
    }
  }

  _start() {
    this._emitStart();
    return utils.thenCall(() => config.startRunner(config));
  }

  _end() {
    return Promise.resolve()
      .then(() => config.endRunner(config))
      .catch(error => this._storeError(error))
      .finally(() => this._emitEnd());
  }

  _getResult() {
    return this._error ? Promise.reject(this._error) : reporter.getResult();
  }

  _emitInit() {
    reporter.handleEvent(RUNNER_INIT, {
      config
    });
  }

  _emitStart() {
    const data = {
      config,
      files: this._reader.files,
      onlyFiles: this._filter.onlyFiles,
      skippedSuites: this._filter.skippedSuites,
      skippedTests: this._filter.skippedTests,
      skippedInFiles: this._filter.skippedInFiles,
    };
    reporter.handleEvent(RUNNER_START, data);
  }

  _emitEnd() {
    reporter.handleEvent(RUNNER_END, {
      error: this._error
    });
  }
};

