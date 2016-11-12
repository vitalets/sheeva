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
      return null;
    }
    const [env, suites] = item.value;
    const queues = suites
      .map(suite => new Queue(suite))
      .filter(queue => !queue.isEmpty());
    if (queues.length) {
      console.log('start env', env)
    } else {
      console.log('skip env', env)
    }
    return queues;
  }

  _getNextQueue() {
    if (!this._queues) {
      return null;
    } else if (this._queues.length) {
      return this._queues.shift();
    } else {
      this._queues = this._nextEnv();
      return this._getNextQueue();
    }
  }
};
