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
    const queues = suites
      .map(suite => new Queue(suite))
      .filter(queue => !queue.isEmpty());

    queues.forEach(queue => {
      queue.onEvent = (event, data) => this._reporter.onSessionEvent(event, data);
      queue.run()
    });
  }

};
