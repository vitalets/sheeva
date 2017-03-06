/**
 * Session - single concurrent worker for running queues on particular env.
 */

const {config} = require('../../configurator');
const reporter = require('../../reporter');

const {
  SESSION_START,
  SESSION_STARTED,
  SESSION_ENDING,
  SESSION_END,
} = require('../../events');

const STATUS = {
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
   * @param {Number} options.index
   * @param {Number} options.workerIndex
   * @param {Object} options.env
   */
  constructor(options) {
    this._index = options.index;
    this._workerIndex = options.workerIndex;
    this._env = options.env;
    this._status = STATUS.CREATED;
  }

  get env() {
    return this._env;
  }

  get index() {
    return this._index;
  }

  get workerIndex() {
    return this._workerIndex;
  }

  get isStarted() {
    return this._status === STATUS.STARTED;
  }

  get isStarting() {
    return this._status === STATUS.STARTING;
  }

  start() {
    this._starting();
    return Promise.resolve()
      .then(() => config.startSession(this))
      .then(() => this._started());
  }

  end() {
    if (!this.isStarting && !this.isStarted) {
      return Promise.resolve();
    }

    this._ending();
    return Promise.resolve()
      .then(() => config.endSession(this))
      .then(() => this._ended());
  }

  _starting() {
    if (this._status !== STATUS.CREATED) {
      throw new Error(`Can not start session ${this._index} as it is already in ${this._status} status`);
    }
    this._emit(SESSION_START);
    this._status = STATUS.STARTING;
  }

  _started() {
    if (this._status === STATUS.STARTING) {
      this._status = STATUS.STARTED;
      this._emit(SESSION_STARTED);
    }
  }

  _ending() {
    this._status = STATUS.ENDING;
    this._emit(SESSION_ENDING);
  }

  _ended() {
    this._status = STATUS.ENDED;
    this._emit(SESSION_END);
  }

  _emit(event, data = {}) {
    data.session = this;
    data.env = this._env;
    reporter.handleEvent(event, data);
  }
};
