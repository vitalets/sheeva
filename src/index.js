/**
 * Sheeva
 */

const utils = require('./utils');
const Base = require('./base');
const Configurator = require('./configurator');
const Reader = require('./reader');
const Filter = require('./filter');
const Sorter = require('./sorter');
const Executer = require('./executer');
const Reporter = require('./reporter');
const {RUNNER_START, RUNNER_END} = require('./events');

module.exports = class Sheeva extends Base {
  /**
   * Constructor
   *
   * @param {Config} config
   */
  constructor(config) {
    super();
    this._configurator = new Configurator(config);
    this._config = this._configurator.config;
    this._reader = null;
    this._filter = null;
    this._sorter = null;
    this._reporter = null;
    this._executer = null;
  }
  run() {
    return Promise.resolve()
      .then(() => this._init())
      .then(() => this._readFiles())
      .then(() => this._applyFilter())
      .then(() => this._applySort())
      .then(() => this._startRunner())
      .then(() => this._execute())
      .then(() => this._success(), e => this._fail(e));
  }
  getReporter(index) {
    return this._reporter && this._reporter.get(index);
  }
  _init() {
    this._configurator.run();
    this._reporter = new Reporter(this._config);
  }
  _readFiles() {
    this._reader = new Reader().setBaseProps(this);
    return this._reader.read();
  }
  _applyFilter() {
    this._filter = new Filter().setBaseProps(this);
    return this._filter.run(this._reader.envData);
  }
  _applySort() {
    this._sorter = new Sorter(this._filter.envData).setBaseProps(this);
    return this._sorter.run();
  }
  _startRunner() {
    this._emitStart();
    return utils.thenCall(() => this._config.startRunner(this._config));
  }
  _execute() {
    this._executer = new Executer().setBaseProps(this);
    return this._executer.run(this._sorter.envFlatSuites);
  }
  _success() {
    return this._endRunner();
  }
  _fail(e) {
    return this._endRunner(e || new Error('Empty rejection'));
  }
  _endRunner(runnerError) {
    return Promise.resolve()
      .then(() => this._config.endRunner(this._config))
      .then(() => {
        this._emitEnd(runnerError);
        return runnerError ? Promise.reject(runnerError) : this._reporter.getResult();
      }, e => {
        this._emitEnd(runnerError || e);
        return Promise.reject(runnerError || e);
      });
  }
  _emitStart() {
    const data = {
      config: this._config,
      files: this._reader.files,
      onlyFiles: this._filter.onlyFiles,
    };
    this._emit(RUNNER_START, data);
  }
  _emitEnd(error) {
    this._emit(RUNNER_END, {error});
  }
};

