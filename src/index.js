/**
 * Sheeva
 */

const events = require('./events');
const config = require('./config');
const Reader = require('./reader');
const Executor = require('./executor');
const Reporter = require('./reporter');

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Config} inConfig
   */
  constructor(inConfig) {
    // todo: use Config class
    this._config = config(inConfig);
  }
  run() {
    this._envs = this._config.createEnvs();
    this._reader = new Reader({
      envs: this._envs,
      tags: this._config.tags
    });
    this._reporter = new Reporter({
      reporters: this._config.reporters
    });
    this._executor = new Executor({
      reporter: this._reporter,
      config: this._config,
    });
    this._reader.read(this._config.context, this._config.files);
    this._emitStart();
    return this._executor.run(this._reader.envSuites)
      .then(() => this._emitEnd(), e => console.log(e))
  }
  getReporter(index) {
    return this._reporter.get(index);
  }
  _emitStart() {
    const data = {
      envs: this._envs,
      files: this._reader.files,
      config: this._config,
    };
    this._reporter.onEvent(events.START, data);
  }
  _emitEnd() {
    this._reporter.onEvent(events.END);
  }
};

