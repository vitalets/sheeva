/**
 * Session - single concurrent worker for particular env used in queues for run.
 */

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
    this.env = options.env;
  }

  start() {
    return Promise.resolve()
      .then(() => this._config.createSessionData(this.env))
      .then(data => this.data = data);
  }

  close() {
    return Promise.resolve()
      .then(() => this._config.clearSessionData(this.data, this))
      .then(() => this.data = null);
  }

  createWrapFn(params) {
    params.session = this;
    return this._config.createWrapFn(params);
  }

  emit(event, data = {}) {
    data.session = this;
    this._reporter.onEvent(event, data);
  }
};
