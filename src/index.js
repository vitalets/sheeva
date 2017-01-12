/**
 * Sheeva
 */

const config = require('./config');
const Reader = require('./reader');
//const Reformer = require('./reformer');
const Executer = require('./executer');
const Reporter = require('./reporter');
const sorter = require('./filter/sorter');
const {RUNNER_START, RUNNER_END} = require('./events');

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Config} inConfig
   */
  constructor(inConfig) {
    this._inConfig = inConfig;
    this._config = null;
    this._envs = null;
    this._reader = null;
    this._reformer = null;
    this._reporter = null;
    this._executer = null;
  }
  run() {
    return Promise.resolve()
      .then(() => this._init())
      .then(() => this._readFiles())
     // .then(() => this._prepare())
      .then(() => this._flattenAndSort())
      .then(() => this._startRunner())
      .then(() => this._execute())
      .then(() => this._endRunner(), e => this._endRunner(e || new Error('Empty rejection')));
  }
  getReporter(index) {
    return this._reporter && this._reporter.get(index);
  }
  _init() {
    this._createConfig();
    this._createEnvs();
    this._createReader();
    //this._createReformer();
    this._createReporter();
    this._createExecuter();
  }
  _createConfig() {
    this._config = config.parse(this._inConfig);
  }
  _createEnvs() {
    this._envs = config.createEnvs(this._config);
  }
  _createReader() {
    this._reader = new Reader({
      envs: this._envs,
    });
  }
  _createReformer() {
    this._reformer = new Reformer({
      config: this._config,
    });
  }
  _createReporter() {
    this._reporter = new Reporter({
      reporters: this._config.reporters,
      envs: this._envs,
      timings: this._config.timings,
    });
  }
  _createExecuter() {
    this._executer = new Executer().setBaseProps(this);
  }
  _readFiles() {
    //this._filter = new Filter().process(this._reader.envSuites);
    //if ()
    return this._reader.read(this._config.files);
  }
  _prepare() {
    return this._reformer.process(this._reader.envSuites);
  }
  _flattenAndSort() {
    this._envFlatSuites = new Map();
    this._reader.envSuites.forEach((suites, env) => {
      const flatSuites = sorter.flattenAndSort(suites);
      this._envFlatSuites.set(env, flatSuites);
    });
  }
  _startRunner() {
    this._emitStart();
    return Promise.resolve()
      .then(() => this._config.startRunner(this._config))
  }
  _execute() {
    return this._executer.run(this._envFlatSuites);
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
      //onlyFiles: this._reader.onlyFiles,
      onlyFiles: [],
      config: this._config,
    };
    this._reporter.handleEvent(RUNNER_START, data);
  }
  _emitEnd(error) {
    if (this._reporter) {
      this._reporter.handleEvent(RUNNER_END, {error});
    }
  }
  _getEnvLabels() {
    return new Map(this._envs.map(env => [env, this._config.createEnvLabel(env)]));
  }
};

