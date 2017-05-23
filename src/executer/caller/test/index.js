/**
 * Calls test fn with beforeEach / afterEach hooks.
 * Used in Queue.
 */

const {config} = require('../../../config');
const reporter = require('../../../reporter');
const {TEST_START, TEST_RETRY, TEST_END} = require('../../../events');
const BeforeEach = require('../hooks/pre/before-each');
const AfterEach = require('../hooks/post/after-each');
const HookFn = require('../hooks/hook-fn');
const Fn = require('../shared/fn');
const Retry = require('./retry');

const TestCaller = module.exports = class TestCaller {
  constructor(session, test) {
    this._session = session;
    this._test = test;
    this._retry = new Retry(this._test);
    this._context = null;
    this._hookFn = null;
    this._suiteStack = null;
  }

  /**
   * Calls test fn with beforeEach / afterEach hooks.
   *
   * @returns {Promise}
   */
  call() {
    return Promise.resolve()
      .then(() => this._reset())
      .then(() => this._callBeforeEach())
      .then(() => this._callTest())
      .finally(e => this._callAfterEach(e))
      .then(() => this._retry.planned ? this.call() : null);
  }

  _reset() {
    this._retry.planned = false;
    this._context = {};
    this._suiteStack = [];
    this._hookFn = new HookFn(this._session, this._context);
  }

  _callBeforeEach() {
    return new BeforeEach(this._hookFn, this._suiteStack).call(this._test);
  }

  _callAfterEach(error) {
    return new AfterEach(this._hookFn, this._suiteStack).call()
      .catch(e => Promise.reject(error || e));
  }

  _callTest() {
    this._emit(TEST_START);
    return this._callFn()
      .then(() => this._emit(TEST_END), e => this._handleTestError(e));
  }

  _handleTestError(error) {
    Object.defineProperty(error, 'test', {value: this._test});
    if (!config.breakOnError && this._retry.isPossible()) {
      this._retry.planned = true;
      this._retry.increaseValues(error);
      this._emit(TEST_RETRY, {error});
    } else {
      this._emit(TEST_END, {error});
      return config.breakOnError ? Promise.reject(error) : null;
    }
  }

  _callFn() {
    const params = {
      session: this._session,
      target: this._session.target,
      fn: this._test.fn,
      test: this._test,
      suite: this._test.parent,
      context: this._context,
      attempt: this._retry.attempt,
    };
    return new Fn({timeout: this._retry.timeout}).call(params);
  }

  _emit(event, data) {
    data = Object.assign({
      session: this._session,
      target: this._session.target,
      test: this._test,
      attempt: this._retry.attempt
    }, data);
    reporter.handleEvent(event, data);
  }
};

TestCaller.isTestError = function (error) {
  return error && Boolean(error.test);
};
