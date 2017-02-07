/**
 * Sheeva
 */

const utils = require('./utils');
const configurator = require('./configurator');
const reporter = require('./reporter');
const Reader = require('./reader');
const Filter = require('./filter');
const Flattener = require('./flattener');
const Executer = require('./executer');
const {RUNNER_START, RUNNER_END} = require('./events');

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
  }

  run() {
    return Promise.resolve()
      .then(() => this._init())
      .then(() => this._readFiles())
      .then(() => this._applyFilter())
      .then(() => this._applyFlatten())
      .then(() => this._startRunner())
      .then(() => this._execute())
      .then(() => this._success(), e => this._fail(e));
  }

  getReporter(index) {
    return reporter.get(index);
  }

  _init() {
    configurator.init(this._rawConfig);
    reporter.init();
  }

  _readFiles() {
    return this._reader.read();
  }

  _applyFilter() {
    return this._filter.run(this._reader.envData);
  }

  _applyFlatten() {
    return this._flattener.run(this._filter.envData);
  }

  _execute() {
    return this._executer.run(this._flattener.envFlatSuites);
  }

  _success() {
    return this._endRunner();
  }

  _fail(e) {
    return this._endRunner(e || new Error('Empty rejection'));
  }

  _startRunner() {
    this._emitStart();
    return utils.thenCall(() => config.startRunner(config));
  }

  _endRunner(runnerError) {
    return Promise.resolve()
      .then(() => config.endRunner(config))
      .then(() => {
        this._emitEnd(runnerError);
        return runnerError ? Promise.reject(runnerError) : reporter.getResult();
      }, e => {
        this._emitEnd(runnerError || e);
        return Promise.reject(runnerError || e);
      });
  }

  _emitStart() {
    const data = {
      config,
      files: this._reader.files,
      onlyFiles: this._filter.onlyFiles,
    };
    reporter.handleEvent(RUNNER_START, data);
  }

  _emitEnd(error) {
    reporter.handleEvent(RUNNER_END, {error});
  }
};

