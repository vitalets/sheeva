/**
 * Session - single concurrent worker for particular env.
 * Session is located in Slot and runs Queues serially.
 */

const {config} = require('../../configurator');
const reporter = require('../../reporter');
const Caller = require('./caller');

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
   * @param {Number} index
   * @param {Object} env
   */
  constructor(index, env) {
    this._index = index;
    this._env = env;
    this._status = STATUS.CREATED;
    this._caller = new Caller(this);
  }

  get env() {
    return this._env;
  }

  get index() {
    return this._index;
  }

  get isStarted() {
    return this._status === STATUS.STARTED;
  }

  start() {
    this._starting();
    return Promise.resolve()
      .then(() => config.startSession(this))
      .then(() => this._started());
  }

  canRun(queue) {
    return this._env === queue.suite.env;
  }

  run(queue) {
    return queue.run(this._caller);
  }

  end() {
    if (!this._isStartingOrStarted()) {
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

  _isStartingOrStarted() {
    return this._status === STATUS.STARTING || this._status === STATUS.STARTED
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
