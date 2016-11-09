/**
 * Session - single concurrent worker in particular environment
 */

module.exports = class Session {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Reporter} options.reporter
   */
  constructor(options) {

  }

  run(queue) {
    const queues = suitesToRun.map(suite => new Queue(suite));
    queues.forEach(queue => {
      queue.onEvent = (event, data) => this._reporter.onSessionEvent(event, data);
      queue.run()
    });
  }
};
