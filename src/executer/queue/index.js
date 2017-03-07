/**
 * Queue executes flat suite of tests serially.
 *
 * Errors processing:
 * 1. error in test - just report and go to next test
 * 2. error in hook - move index to suite end and continue from the next suite
 * 3. error in outer code - reject queue execution
 *
 * @type {Queue}
 */

const utils = require('../../utils');
const {assertArray, assertLength} = require('../../utils/assert');
const {config} = require('../../configurator');
const {TestCaller, SuiteHooksCaller, errors} = require('../caller');
const Cursor = require('./cursor');

module.exports = class Queue {
  /**
   * Constructor
   *
   * @param {Array} tests
   */
  constructor(tests) {
    assertTests(tests);
    this._suiteStack = [];
    this._cursor = new Cursor(tests);
    this._session = null;
    this._suiteHooksCaller = null;
    this._isRunning = false;
    this._error = null;
    this._promised = new utils.Promised();
  }

  get tests() {
    return this._cursor.tests;
  }

  get topSuite() {
    return this.tests[0].parents[0];
  }

  get env() {
    return this.topSuite.env;
  }

  /**
   * Remaining tests count depends on if queue is running or not,
   * because queue runs hooks considering next test,
   * and if this test will be splitted out we will get error.
   *
   * todo: make getter
   *
   * @returns {Number}
   */
  getRemainingTestsCount() {
    return this._isRunning
      ? this._cursor.remainingTestsCount - 1
      : this._cursor.remainingTestsCount;
  }

  /**
   * Runs queue on session
   *
   * @param {Session} session
   * @returns {Promise}
   */
  runOn(session) {
    return this._promised.call(() => {
      this._isRunning = true;
      this._session = session;
      this._suiteHooksCaller = this._createHooksCaller();
      this._handleNextTest();
    });
  }

  /**
   * Handles next test in queue.
   * We handle next test even
   *
   *
   * It does not return promise to keep each test in separate promise chain
   * instead of one chain for all tests.
   *
   * @returns {undefined}
   */
  _handleNextTest() {
    Promise.resolve()
      .then(() => this._moveCursor())
      .then(() => this._executeTest())
      .catch(e => this._handleError(e))
      .then(() => this._handleNextTestIfNeeded())
      .catch(e => this._finalize(e));
  }

  /**
   * Here we check not nextTest but currentTest as we need to call all after hooks
   */
  _handleNextTestIfNeeded() {
    if (this._hasCurrentTest()) {
      this._handleNextTest();
    } else {
      this._finalize();
    }
  }

  _moveCursor() {
    return this._cursor.isSuiteBoundary()
      ? this._moveCursorWithHooks()
      : this._moveCursorWithoutHooks();
  }

  _moveCursorWithHooks() {
    return Promise.resolve()
      .then(() => this._executeAfterHooks())
      .then(() => this._moveCursorWithoutHooks())
      .then(() => this._executeBeforeHooks());
  }

  _executeBeforeHooks() {
    if (this._hasCurrentTest()) {
      this._suiteHooksCaller = this._createHooksCaller();
      return this._suiteHooksCaller.callBefore(this._cursor.currentTest);
    }
  }

  _executeAfterHooks() {
    const stopSuite = this._cursor.findCommonSuiteWithNextTest();
    return this._suiteHooksCaller.callAfter(stopSuite);
  }

  _executeTest() {
    if (this._hasCurrentTest()) {
      return new TestCaller(this._session, this._cursor.currentTest).call();
    }
  }

  _handleError(error) {
    this._storeError(error);
    return this._isTerminationError() ? this._terminate() : this._moveToErrorSuiteEnd();
  }

  _isTerminationError() {
    return !errors.isHookError(this._error) || config.breakOnError;
  }

  _terminate() {
    this._cursor.moveToQueueEnd();
    return this._executeAfterHooks()
      .finally(() => Promise.reject(this._error));
  }

  _moveToErrorSuiteEnd() {
    const suite = errors.getSuiteFromError(this._error);
    this._cursor.moveToSuiteEnd(suite);
    this._clearError();
  }

  _moveCursorWithoutHooks() {
    return this._cursor.moveToNextText();
  }

  _storeError(error) {
    this._error = error;
    this._suiteHooksCaller.addError(error);
  }

  _clearError() {
    this._error = null;
  }

  _createHooksCaller() {
    return new SuiteHooksCaller(this._session, null, this._suiteStack);
  }

  _hasCurrentTest() {
    return Boolean(this._cursor.currentTest);
  }

  _finalize(error) {
    this._promised.fulfill(this._error || error);
  }
};

function assertTests(tests) {
  assertArray(tests, 'Queue should be created from tests array');
  assertLength(tests, 'Queue should be created on non-empty tests array');
}
