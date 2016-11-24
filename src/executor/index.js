/**
 * Run suites: pushes queque per queue into pool
 */

const Queue = require('./queue');
const Pool = require('./pool');
const flatten = require('./flatten');
const {ENV_START} = require('../events');

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
      getNextQueue: () => this._getNextQueue(),
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
      this._createQueues(suites);
      if (this._queues.length) {
        this._emitEnvStart(env);
      }
    }
  }

  _getNextQueue() {
    if (!this._queues) {
      return {};
    } else if (this._queues.length) {
      const queue = this._queues.shift();
      const isLastQueue = this._queues.length === 0;
      return {queue, isLastQueue};
    } else {
      // dont emit ENV_END here as sessions are still finishing
      this._nextEnv();
      return this._getNextQueue();
    }
  }

  _createQueues(suites) {
    this._queues = flatten(suites)
      .map(item => new Queue(item.tests))
      .filter(queue => !queue.isEmpty());
  }

  _emitEnvStart(env) {
    const label = this._config.createEnvLabel(env);
    const testsCount = this._queues.reduce((res, queue) => res + queue.tests.length, 0);
    this._reporter.handleEvent(ENV_START, {env, label, testsCount, queues: this._queues});
  }
};
