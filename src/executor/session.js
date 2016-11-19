/**
 * Session - single concurrent worker for particular env used in queues for run.
 */

const {
  SESSION_START,
  SESSION_STARTED,
  SESSION_ENDING,
  SESSION_END,
} = require('../events');

module.exports = class Session {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Reporter} options.reporter
   * @param {Object} options.config
   * @param {Object} options.env
   */
  constructor(options) {
    this._reporter = options.reporter;
    this._config = options.config;
    this._env = options.env;
    this._data = null;
  }

  get env() {
    return this._env;
  }

  get data() {
    return this._data;
  }

  start() {
    this.emit(SESSION_START);
    return Promise.resolve()
      .then(() => this._config.createSessionData(this._env))
      .then(data => {
        this._data = data;
        this.emit(SESSION_STARTED);
      });
  }

  close() {
    this.emit(SESSION_ENDING);
    return Promise.resolve()
      .then(() => this._config.clearSessionData(this._data, this))
      .then(() => {
        this._data = null;
        this.emit(SESSION_END);
      });
  }

  createWrapFn(params) {
    params.session = this;
    params.env = this._env;
    return this._config.createWrapFn(params);
  }

  emit(event, data = {}) {
    data.session = this;
    data.env = this._env;
    this._reporter.onEvent(event, data);
  }

};
