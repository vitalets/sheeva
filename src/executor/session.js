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

const STATE = {
  CREATED: 'created',
  STARTING: 'starting',
  STARTED: 'started',
  ENDING: 'ending',
  ENDED: 'ended',
};

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
    this._state = STATE.CREATED;
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
    return this._state === STATE.STARTED;
  }

  run(queue) {
    this._queue = queue;
    return Promise.resolve()
      .then(() => this.started ? null : this.start())
      .then(() => queue.run(this._caller))
  }

  start() {
    if (this._state !== STATE.CREATED) {
      throw new Error(`Can not start session ${this._index} as it is already in ${this._state} state`);
    }
    this.emit(SESSION_START);
    this._state = STATE.STARTING;
    return Promise.resolve()
      .then(() => this._config.startSession(this._env, this))
      .then(() => {
        this._state = STATE.STARTED;
        this.emit(SESSION_STARTED);
      });
  }

  end() {
    // try end session even if it in starting state for better cleanup
    if (this._state === STATE.STARTING || this._state === STATE.STARTED) {
      this._state = STATE.ENDING;
      this.emit(SESSION_ENDING);
      return Promise.resolve()
        .then(() => this._config.endSession(this))
        .then(() => {
          this._state = STATE.ENDED;
          this.emit(SESSION_END);
        });
    } else {
      return Promise.resolve();
    }
  }

  emit(event, data = {}) {
    data.session = this;
    data.env = this._env;
    this._reporter.handleEvent(event, data);
  }

};
