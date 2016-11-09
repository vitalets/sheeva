/**
 * Run suites
 */

const Queue = require('./queue');

module.exports = class Executor {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Reporter} options.reporter
   * @param {Config} options.config
   */
  constructor(options) {
    this._reporter = options.reporter;
    this._config = options.config;
  }

  /**
   * Run
   *
   * @param {Map} envSuites
   */
  run(envSuites) {
    envSuites.forEach(this._runEnv, this);
  }

  _runEnv(suites, env) {
    console.log('running env', env, suites.length)
  }

};
