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
const {config} = require('../../configurator');
const {TestCaller, SuiteHooksCaller} = require('../caller');
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
   * It does not return promise to keep each test in separate promise chain
   * instead of one chain for all tests.
   *
   * @returns {undefined}
   */
  _handleNextTest() {
    Promise.resolve()
      .then(() => this._moveCursor())
      .then(() => this._callTest())
      .catch(error => this._handleError(error))
      .then(() => this._hasCurrentTest() ? this._handleNextTest() : this._promised.resolve())
      .catch(error => this._promised.reject(error));
  }

  _moveCursor() {
    return this._cursor.isSuiteBoundary()
      ? this._moveCursorWithHooks()
      : this._moveCursorWithoutHooks();
  }

  _callTest() {
    if (this._hasCurrentTest()) {
      return new TestCaller(this._session, this._cursor.currentTest).call();
    }
  }

  _handleError(error) {
    const isHooksError = Boolean(error.suite);
    if (isHooksError && this._handleHooksError(error)) {
      return Promise.resolve();
    } else {
      return this._terminate(error);
    }
  }

  _handleHooksError(error) {
    if (!this._suiteHooksCaller.firstError) {
      this._suiteHooksCaller.storeEachHooksError(error);
    }

    if (!config.breakOnError) {
      this._cursor.moveToSuiteEnd(error.suite);
      return true;
    } else {
      return false;
    }
  }

  _terminate(error) {
    this._cursor.moveToQueueEnd();
    return this._moveCursor()
      .finally(() => Promise.reject(error));
  }

  _hasCurrentTest() {
    return Boolean(this._cursor.currentTest);
  }

  _moveCursorWithHooks() {
    return Promise.resolve()
      .then(() => this._callAfterHooks())
      .then(() => this._moveCursorWithoutHooks())
      .then(() => this._callBeforeHooks())
  }

  _moveCursorWithoutHooks() {
    return this._cursor.moveToNextText();
  }

  _callBeforeHooks() {
    if (this._hasCurrentTest()) {
      this._suiteHooksCaller = this._createHooksCaller();
      return this._suiteHooksCaller.callBefore(this._cursor.currentTest);
    }
  }

  _callAfterHooks() {
    const stopSuite = this._cursor.findCommonSuiteWithNextTest();
    return this._suiteHooksCaller.callAfter(stopSuite);
  }

  _createHooksCaller() {
    return new SuiteHooksCaller(this._session, null, this._suiteStack);
  }
};

function assertTests(tests) {
  if (!Array.isArray(tests) || !tests.length) {
    throw new Error('Queue should be created on non-empty tests array');
  }
}
