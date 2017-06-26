'use strict';

/**
 * Queue executes flat suite of tests serially.
 *
 * Here can be 3 types of errors:
 * 1. error in test - terminate only if config.breakOnError = true
 * 2. error in hook - move index to the end of errored suite and continue from the next suite
 * 3. error in runner - terminate queue: move to the end and execute all after hooks
 */

const utils = require('../../utils');
const {config} = require('../../configurator');
const reporter = require('../../reporter');
const {EXTRA_ERROR} = require('../../events');
const BeforeHooks = require('../caller/hooks/pre/before');
const AfterHooks = require('../caller/hooks/post/after');
const HookFn = require('../caller/hooks/hook-fn');
const TestCaller = require('../caller/test');
const Cursor = require('./cursor');

module.exports = class Queue {
  /**
   * Constructor
   *
   * @param {FlatSuite} flatSuite
   */
  constructor(flatSuite) {
    this._flatSuite = flatSuite;
    this._cursor = new Cursor(flatSuite.tests);
    this._session = null;
    this._hookFn = null;
    this._beforeHooks = null;
    this._afterHooks = null;
    this._isRunning = false;
    this._suiteStack = [];
    this._error = null;
    this._promised = new utils.Promised();
  }

  get index() {
    return this._flatSuite.index;
  }

  get tests() {
    return this._cursor.tests;
  }

  get topSuite() {
    return this.tests[0].parents[0];
  }

  get target() {
    return this.topSuite.target;
  }

  /**
   * Remaining tests count depends on if queue is running or not,
   * because queue considering next test and if next test will be splitted out we will get error.
   *
   * @returns {Number}
   */
  get remainingTestsCount() {
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
      this._hookFn = new HookFn(session, null);
      this._beforeHooks = new BeforeHooks(this._hookFn, this._suiteStack);
      this._afterHooks = new AfterHooks(this._hookFn, this._suiteStack);
      this._handleNextTest();
    });
  }

  /**
   * Handles next test in queue (recursively).
   *
   * It does not return promise to keep each test in separate promise chain
   * instead of one chain for all tests.
   */
  _handleNextTest() {
    Promise.resolve()
      .then(() => this._moveCursor())
      .then(() => this._executeTest())
      .catch(e => this._handleError(e))
      .then(() => this._hasCurrentTest() ? this._handleNextTest() : this._promised.resolve())
      .catch(e => this._promised.reject(e));
  }

  _moveCursor() {
    return this._cursor.isSuiteBoundary()
      ? this._moveCursorWithHooks()
      : this._moveCursorWithoutHooks();
  }

  _executeTest() {
    if (this._hasCurrentTest()) {
      return new TestCaller(this._session, this._cursor.currentTest).call();
    }
  }

  /**
   * Here can be 3 types of errors:
   *
   * 1. error in test
   *   - config.breakOnError = true: terminate
   *   - config.breakOnError = false: such error will never come here
   *
   * 2. error in hook
   *   - config.breakOnError = true: terminate
   *   - config.breakOnError = false: no terminate. Move index to the end of errored suite
   *     and continue from the next suite
   *
   * 3. error in runner
   * -  always terminate despite of config.breakOnError
   */
  _handleError(error) {
    this._error = error;
    return this._shouldTerminate() ? this._terminate() : this._moveToErrorSuiteEnd();
  }

  _moveCursorWithHooks() {
    return Promise.resolve()
      .then(() => this._hasCurrentTest() ? this._executeAfterHooks() : null)
      .then(() => this._moveCursorWithoutHooks())
      .then(() => this._hasCurrentTest() ? this._executeBeforeHooks() : null);
  }

  _executeBeforeHooks() {
    return this._beforeHooks.call(this._cursor.currentTest);
  }

  _executeAfterHooks() {
    const stopSuite = this._cursor.findCommonSuiteWithNextTest();
    return this._afterHooks.call(stopSuite);
  }

  _shouldTerminate() {
    return config.breakOnError || !HookFn.isHookError(this._error);
  }

  _terminate() {
    return Promise.resolve()
      .then(() => this._cursor.moveToQueueEnd())
      .then(() => this._executeAfterHooks())
      .catch(e => reporter.handleEvent(EXTRA_ERROR, {error: e}))
      .finally(() => Promise.reject(this._error));
  }

  _moveToErrorSuiteEnd() {
    const suite = HookFn.extractSuiteFromError(this._error);
    this._cursor.moveToSuiteEnd(suite);
    this._error = null;
  }

  _moveCursorWithoutHooks() {
    return this._cursor.moveToNextText();
  }

  _hasCurrentTest() {
    return Boolean(this._cursor.currentTest);
  }
};
