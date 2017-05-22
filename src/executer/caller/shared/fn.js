/**
 * Calls test/hook function via `config.callTestHookFn`
 * Rejects result if timeout exceeded.
 */

const {config} = require('../../../config');

const Fn = module.exports = class Fn {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Number} options.timeout
   */
  constructor(options = {}) {
    this._timeout = options.timeout;
    this._timer = null;
    this._result = null;
  }

  /**
   * Calls test/hook function
   *
   * @param {Object} params
   * @returns {Promise}
   */
  call(params) {
    try {
      this._result = config.callTestHookFn(params);
      return this._isAsync() && this._hasTimeout()
        ? this._raceWithTimeout()
        : Promise.resolve(this._result);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  _isAsync() {
    return this._result && typeof this._result.then === 'function';
  }

  _hasTimeout() {
    return Boolean(this._timeout);
  }

  _raceWithTimeout() {
    return Promise.race([this._result, this._setTimer()])
      .finally(() => this._clearTimer());
  }

  _setTimer() {
    return new Promise((resolve, reject) => {
      this._timer = setTimeout(() => this._rejectByTimeout(reject), this._timeout);
    });
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _rejectByTimeout(reject) {
    this._timer = null;
    const error = new Fn.TimeoutError(`Timeout ${this._timeout} ms exceeded`);
    reject(error);
  }
};

Fn.TimeoutError = class TimeoutError extends Error {};
