/**
 * Sheeva
 */

const utils = require('./utils');
const Base = require('./base');
const config = require('./config');
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
   * @param {Config} inConfig
   */
  constructor(inConfig) {
    super();
    this._inConfig = inConfig;
    this._config = null;
    this._envs = null;
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
    this._createConfig();
    this._createEnvs();
    this._createReporter();
  }
  _createConfig() {
    this._config = config.parse(this._inConfig);
  }
  _createEnvs() {
    this._envs = config.createEnvs(this._config);
  }
  _createReporter() {
    this._reporter = new Reporter({
      reporters: this._config.reporters,
      envs: this._envs,
      timings: this._config.timings,
    });
  }
  _readFiles() {
    this._reader = new Reader({
      envs: this._envs,
    });
    return this._reader.read(this._config.files);
  }
  _applyFilter() {
    this._filter = new Filter().setBaseProps(this);
    this._filter.run(this._reader.envData);
  }
  _applySort() {
    this._sorter = new Sorter(this._filter.envData).run();
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
      envs: this._envs,
      envLabels: this._getEnvLabels(),
      files: this._reader.files,
      onlyFiles: this._filter.onlyFiles,
      config: this._config,
    };
    this._emit(RUNNER_START, data);
  }
  _emitEnd(error) {
    this._emit(RUNNER_END, {error});
  }
  _getEnvLabels() {
    return new Map(this._envs.map(env => [env, this._config.createEnvLabel(env)]));
  }
};

