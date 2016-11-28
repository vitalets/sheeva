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
    // todo: use Config class
    this._config = config(inConfig);
    this._startEventEmitted = false;
  }
  run() {
    try {
      this._createEnvs();
      this._createReader();
      this._createReporter();
      this._createExecuter();
      this._reader.read(this._config.files);
      this._emitStart();
      return this._executor.run(this._reader.envSuites)
        .then(() => this._successEnd(), e => this._errorEnd(e));
    } catch (e) {
      return this._errorEnd(e);
    }
  }
  getReporter(index) {
    return this._reporter.get(index);
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
  _createExecuter() {
    this._executor = new Executor({
      reporter: this._reporter,
      config: this._config,
    });
  }
  _successEnd() {
    this._emitEnd();
    return this._reporter.getResult();
  }
  _errorEnd(e) {
    if (this._startEventEmitted) {
      this._emitEnd(e);
    }
    return Promise.reject(e);
  }
  _emitStart() {
    const envLabels = new Map(this._envs.map(env => [env, this._config.createEnvLabel(env)]));
    const data = {
      envs: this._envs,
      envLabels: envLabels,
      files: this._reader.files,
      config: this._config,
    };
    this._reporter.handleEvent(RUNNER_START, data);
    this._startEventEmitted = true;
  }
  _emitEnd(error) {
    this._reporter.handleEvent(RUNNER_END, {error});
  }
};

