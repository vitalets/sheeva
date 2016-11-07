/**
 * Run suites
 */

const Queue = require('./queue');

module.exports = class Executor {
  constructor(reporter) {
    this._reporter = reporter;
  }
  run(suites) {
    const queues = suites.map(suite => new Queue(suite));
    queues.forEach(queue => {
      queue.onEvent = (event, data) => this._reporter.onSessionEvent(event, data);
      queue.run()
    });
  }
};
