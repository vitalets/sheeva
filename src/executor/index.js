/**
 * Run suites
 */

const Queue = require('./queue');
const Pool = require('./pool');
const debug = require('../debug');

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
    this._queues = [];
    this._pool = new Pool({
      reporter: this._reporter,
      config: this._config,
      getQueue: () => this._getNextQueue(),
    });
  }

  /**
   * Run
   *
   * @param {Map} envSuites
   */
  run(envSuites) {
    this._envIterator = envSuites.entries();
    return this._pool.run();
  }

  _nextEnv() {
    const item = this._envIterator.next();
    if (item.done) {
      this._queues = null;
    } else {
      const [env, suites] = item.value;
      this._queues = suites
        .map(suite => new Queue(suite))
        .filter(queue => !queue.isEmpty());
    }
  }

  _getNextQueue() {
    if (!this._queues) {
      return null;
    } else if (this._queues.length) {
      return this._queues.shift();
    } else {
      this._nextEnv();
      return this._getNextQueue();
    }
  }
};
