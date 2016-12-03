/**
 * Session - single concurrent worker for particular env.
 * Runs queues of tests.
 */

const {
  SESSION_START,
  SESSION_STARTED,
  SESSION_ENDING,
  SESSION_END,
} = require('../events');

const Caller = require('./caller');

module.exports = class Session {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Reporter} options.reporter
   * @param {Object} options.config
   * @param {Object} options.env
   * @param {Number} options.index
   */
  constructor(options) {
    this._reporter = options.reporter;
    this._config = options.config;
    this._env = options.env;
    this._index = options.index;
    this._started = false;
    this._caller = new Caller({
      config: options.config,
      session: this,
    });
    this._queue = null;
  }

  get env() {
    return this._env;
  }

  get index() {
    return this._index;
  }

  get queue() {
    return this._queue;
  }

  get started() {
    return this._started;
  }

  run(queue) {
    this._queue = queue;
    return Promise.resolve()
      .then(() => this._started ? null : this.start())
      .then(() => queue.run(this._caller))
  }

  start() {
    this.emit(SESSION_START);
    return Promise.resolve()
      .then(() => this._config.startSession(this._env, this))
      .then(() => {
        this._started = true;
        this.emit(SESSION_STARTED);
      });
  }

  close() {
    this.emit(SESSION_ENDING);
    return Promise.resolve()
      .then(() => this._config.endSession(this))
      .then(() => this.emit(SESSION_END));
  }

  emit(event, data = {}) {
    data.session = this;
    data.env = this._env;
    this._reporter.handleEvent(event, data);
  }

};
