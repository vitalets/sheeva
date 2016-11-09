/**
 * Run suites
 */

const Queue = require('./queue');

module.exports = class Executor {
  constructor(reporter) {
    this._reporter = reporter;
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
    const onlySuites = suites.filter(suite => suite.hasOnly);
    const suitesToRun = onlySuites.length ? onlySuites : suites;
    const queues = suitesToRun.map(suite => new Queue(suite));
    queues.forEach(queue => {
      queue.onEvent = (event, data) => this._reporter.onSessionEvent(event, data);
      queue.run()
    });
  }
};
