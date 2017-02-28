/**
 * Calls tests fn with beforeEach / afterEach hooks
 * Used in Queue.
 */

const {config} = require('../../configurator');
const reporter = require('../../reporter');
const {TEST_START, TEST_RETRY, TEST_END} = require('../../events');
const {TestHooksCaller} = require('./hooks');
const FnCaller = require('./fn');
const errors = require('./errors');

const TIMEOUT_INCREASE_FACTOR = 1.5;

module.exports = class TestCaller {
  constructor(session, test) {
    this._session = session;
    this._test = test;
    this._context = null;
    this._hooksCaller = null;
    this._testError = null;
    this._attempt = 0;
    this._timeout = this._test.timeout || config.timeout;
  }

  /**
   * Calls test fn with beforeEach / afterEach hooks
   *
   * @returns {Promise}
   */
  call() {
    return Promise.resolve()
      .then(() => this._reset())
      .then(() => this._callBeforeEach())
      .then(() => this._callTest())
      .finally(() => this._callAfterEach())
      .finally(() => this._rejectIfError())
      .then(() => this._checkRetry());
  }

  _reset() {
    this._context = {};
    this._hooksCaller = new TestHooksCaller(this._session, this._context);
    this._testError = null;
  }

  _callBeforeEach() {
    return this._hooksCaller.callBeforeEach(this._test);
  }

  _callAfterEach() {
    return this._hooksCaller.callAfterEach();
  }

  _callTest() {
    this._emit(TEST_START);
    return this._callFn()
      .catch(e => this._storeError(e))
      .finally(() => this._emit(this._canRetry() ? TEST_RETRY : TEST_END));
  }

  _storeError(error) {
    this._testError = errors.attachTestToError(error, this._test);
  }

  _checkRetry() {
    if (this._canRetry()) {
      return this._retry();
    }
  }

  _canRetry() {
    const isOnlyTestError = this._testError && !this._hooksCaller.error;
    const hasAttempts = this._test.retry && this._attempt < this._test.retry;
    return isOnlyTestError && hasAttempts;
  }

  _retry() {
    this._attempt++;
    this._increaseTimeoutIfNeeded();
    return this.call();
  }

  _increaseTimeoutIfNeeded() {
    if (this._timeout && this._testError instanceof FnCaller.TimeoutError) {
      this._timeout = Math.round(this._timeout * TIMEOUT_INCREASE_FACTOR);
    }
  }

  /**
   * Reject in two cases:
   *  - error in test and breakOnError enabled
   *  - error in hooks
   */
  _rejectIfError() {
    const error = config.breakOnError && this._testError || this._hooksCaller.error;
    return error ? Promise.reject(error) : null;
  }

  _callFn() {
    const params = {
      session: this._session,
      env: this._session.env,
      fn: this._test.fn,
      test: this._test,
      suite: this._test.parent,
      context: this._context,
      attempt: this._attempt,
    };
    return new FnCaller({timeout: this._timeout}).call(params);
  }

  _emit(event) {
    const data = {
      session: this._session,
      env: this._session.env,
      test: this._test,
      error: this._testError,
    };
    reporter.handleEvent(event, data);
  }
};
