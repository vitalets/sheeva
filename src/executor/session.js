/**
 * Session - single concurrent worker for particular env used in queues for run.
 */

const {SESSION_START, SESSION_END} = require('../events');

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
    return Promise.resolve()
      .then(() => this._config.createSessionData(this._env))
      .then(data => {
        this._data = data;
        this._reporter.onEvent(SESSION_START, {session: this});
      });
  }

  close() {
    return Promise.resolve()
      .then(() => this._config.clearSessionData(this._data, this))
      .then(() => {
        this._data = null;
        this._reporter.onEvent(SESSION_END, {session: this});
      });
  }

  createWrapFn(params) {
    params.session = this;
    params.env = this._env;
    return this._config.createWrapFn(params);
  }

  emit(event, data = {}) {
    data.session = this;
    this._reporter.onEvent(event, data);
  }

};
