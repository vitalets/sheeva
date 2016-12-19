/**
 * Sheeva
 */

const config = require('./config');
const Reader = require('./reader');
const Executor = require('./executor');
const Reporter = require('./reporter');
const {RUNNER_START, RUNNER_END} = require('./events');

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Config} inConfig
   */
  constructor(inConfig) {
    this._config = config.parse(inConfig);
    this._startRunnerCalled = false;
  }
  run() {
    return Promise.resolve()
      .then(() => this._read())
      .then(() => this._startRunner())
      .then(() => this._execute())
      .then(() => this._endRunner(), e => this._endRunner(e || new Error('Empty rejection')));
  }
  getReporter(index) {
    return this._reporter.get(index);
  }
  _read() {
    this._createEnvs();
    this._createReader();
    this._createReporter();
    this._createExecutor();
    return this._reader.read(this._config.files);
  }
  _execute() {
    return this._executor.run(this._reader.envTests);
  }
  _createEnvs() {
    this._envs = this._config.createEnvs();
    if (!this._envs.length) {
      throw new Error('You should provide at lease one env');
    } else {
      const envIds = new Set();
      this._envs.forEach(env => {
        if (!env || !env.id || envIds.has(env.id)) {
          throw new Error('Each env should have unique id property');
        }
        envIds.add(env.id);
      });
    }
  }
  _createReader() {
    this._reader = new Reader({
      envs: this._envs,
      tags: this._config.tags
    });
  }
  _createReporter() {
    this._reporter = new Reporter({
      reporters: this._config.reporters,
      envs: this._envs,
      timings: this._config.timings,
    });
  }
  _createExecutor() {
    this._executor = new Executor({
      reporter: this._reporter,
      config: this._config,
    });
  }
  _startRunner() {
    this._emitStart();
    this._startRunnerCalled = true;
    return Promise.resolve()
      .then(() => this._config.startRunner(this._config))
  }
  _endRunner(runnerError) {
    return Promise.resolve()
      .then(() => this._startRunnerCalled ? this._config.endRunner(this._config) : null)
      .then(() => {
        this._emitEnd(runnerError);
        return runnerError ? Promise.reject(runnerError) : this._reporter.getResult();
      }, e => {
        this._emitEnd(runnerError || e);
        return Promise.reject(runnerError || e);
      });
  }
  _emitStart() {
    const envLabels = new Map(this._envs.map(env => [env, this._config.createEnvLabel(env)]));
    const data = {
      envs: this._envs,
      envLabels: envLabels,
      files: this._reader.files,
      envTests: this._reader.envTests,
      hasOnly: this._reader.hasOnly,
      config: this._config,
    };
    this._reporter.handleEvent(RUNNER_START, data);
  }
  _emitEnd(error) {
    if (this._reporter) {
      this._reporter.handleEvent(RUNNER_END, {error});
    }
  }
};

