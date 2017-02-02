/**
 * Session - single concurrent worker for particular env.
 * Session is located in Slot and runs Queues serially.
 */

const Base = require('../../base');
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

module.exports = class Session extends Base {
  /**
   * Constructor
   *
   * @param {Number} index
   * @param {Object} env
   */
  constructor(index, env) {
    super();
    this._index = index;
    this._env = env;
    this._status = STATUS.CREATED;
    this._caller = new Caller(this);
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

  get isStarted() {
    return this._status === STATUS.STARTED;
  }

  start() {
    this._starting();
    return Promise.resolve()
      .then(() => this._config.startSession(this))
      .then(() => this._started());
  }

  run(queue) {
    this._queue = queue;
    return Promise.resolve()
      //.then(() => this._status === STATUS.STARTED ? null : this._start())
      .then(() => queue.run(this._caller))
      .then(() => this._queue = null)
  }

  end() {
    if (!this._isStartingOrStarted()) {
      return Promise.resolve();
    }

    this._ending();
    return Promise.resolve()
      .then(() => this._config.endSession(this))
      .then(() => this._ended());
  }

  callTestHookFn(params) {
    params = Object.assign({
      session: this,
      env: this._env,
    }, params);
    return this._config.callTestHookFn(params);
  }

  emit(event, data) {
    data = Object.assign({
      session: this,
      env: this._env,
    }, data);
    super._emit(event, data);
  }

  _starting() {
    if (this._status !== STATUS.CREATED) {
      throw new Error(`Can not start session ${this._index} as it is already in ${this._status} status`);
    }
    this.emit(SESSION_START);
    this._status = STATUS.STARTING;
  }

  _started() {
    if (this._status === STATUS.STARTING) {
      this._status = STATUS.STARTED;
      this.emit(SESSION_STARTED);
    }
  }

  _isStartingOrStarted() {
    return this._status === STATUS.STARTING || this._status === STATUS.STARTED
  }

  _ending() {
    this._status = STATUS.ENDING;
    this.emit(SESSION_ENDING);
  }

  _ended() {
    this._status = STATUS.ENDED;
    this.emit(SESSION_END);
  }
};
