/**
 * Calls tests fn with beforeEach / afterEach hooks
 */

const {config} = require('../../configurator');
const reporter = require('../../reporter');
const {TEST_START, TEST_END} = require('../../events');
const {TestHooksCaller} = require('./hooks');

module.exports = class TestCaller {
  constructor(session, test) {
    this._session = session;
    this._test = test;
    this._context = {};
    this._hooksCaller = new TestHooksCaller(session, this._context);
  }

  /**
   * Calls test fn with beforeEach / afterEach hooks
   *
   * @returns {Promise}
   */
  call() {
    return Promise.resolve()
      .then(() => this._hooksCaller.callBeforeEach(this._test))
      .then(() => this._callTest())
      .finally(() => this._hooksCaller.callAfterEach())
      .finally(() => this._rejectForHooksError());
  }

  _callTest() {
    this._emit(TEST_START);
    return this._callFn()
      .catch(error => this._storeError(error))
      .finally(() => this._emit(TEST_END));
  }

  _storeError(error) {
    this._error = error;
  }

  _rejectForHooksError() {
    return this._hooksCaller.firstError ? Promise.reject(this._hooksCaller.firstError) : null;
  }

  _callFn() {
    const params = {
      session: this._session,
      env: this._session.env,
      fn: this._test.fn,
      test: this._test,
      suite: this._test.parent,
      context: this._context,
    };
    return Promise.resolve()
      .then(() => config.callTestHookFn(params));
  }

  _emit(event) {
    const data = {
      session: this._session,
      env: this._session.env,
      test: this._test,
      error: this._error,
    };
    reporter.handleEvent(event, data);
  }
};
