/**
 * Session - single concurrent worker for particular env.
 * Runs queues of tests.
 */

const Base = require('../base');
const Caller = require('./caller');

const {
  SESSION_START,
  SESSION_STARTED,
  SESSION_ENDING,
  SESSION_END,
} = require('../events');

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

  get started() {
    return this._status === STATUS.STARTED;
  }

  run(queue) {
    this._queue = queue;
    return Promise.resolve()
      .then(() => this._status === STATUS.STARTED ? null : this.start())
      .then(() => queue.run(this._caller))
  }

  start() {
    if (this._status !== STATUS.CREATED) {
      throw new Error(`Can not start session ${this._index} as it is already in ${this._status} status`);
    }
    this.emit(SESSION_START);
    this._status = STATUS.STARTING;
    return Promise.resolve()
      .then(() => this._config.startSession(this._env, this))
      .then(() => {
        this._status = STATUS.STARTED;
        this.emit(SESSION_STARTED);
      });
  }

  end() {
    // try end session even if it in starting state for better cleanup
    if (this._status === STATUS.STARTING || this._status === STATUS.STARTED) {
      this._status = STATUS.ENDING;
      this.emit(SESSION_ENDING);
      return Promise.resolve()
        .then(() => this._config.endSession(this))
        .then(() => {
          this._status = STATUS.ENDED;
          this.emit(SESSION_END);
        });
    } else {
      return Promise.resolve();
    }
  }

  call(params) {
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

};
