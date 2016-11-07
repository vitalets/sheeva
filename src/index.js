/**
 * Sheeva
 */

const events = require('./events');
const Reader = require('./reader');
const Executor = require('./executor');
const Reporter = require('./reporter');

const DEFAULT_CONFIG = {
  files: '',
  context: global,
  concurency: 1,
  reporters: 'console'
};

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Object} config
   * @param {String} config.files glob pattern
   * @param {Number} [config.concurency=1]
   * @param {Array<String|Object>} [config.reporters='console']
   */
  constructor(config) {
    this._config = Object.assign({}, DEFAULT_CONFIG, config);
  }
  run() {
    this._createEnvs();
    this._reader = new Reader(this._config.context);
    this._reporter = new Reporter(this._config.reporters);
    this._executor = new Executor(this._reporter);
    this._reader.read(this._config.files);
    this._emitStart();
    this._executor.run(this._reader.suites);
    this._emitEnd();
  }
  getReporter(index) {
    return this._reporter.get(index);
  }
  _createEnvs() {
    this._envs = this._config.createEnvs ? this._config.createEnvs() : ['defaultEnv'];
  }
  _emitStart() {
    const data = {
      envs: this._envs,
      files: this._reader.files,
      fileSuites: this._reader.suites,
      config: this._config,
    };
    this._reporter.onEvent(events.START, data);
  }
  _emitEnd() {
    this._reporter.onEvent(events.END);
  }
};

