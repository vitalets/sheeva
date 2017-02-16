/**
 * Queue - flat sequence of tests.
 * Current index moves test by test executing them with hooks.
 * In case of error in hook, pointer moves to the end of suite.
 *
 * @type {Queue}
 */

const utils = require('../../utils');
const Caller = require('../caller');

module.exports = class Queue {
  /**
   * Constructor
   *
   * @param {Array} tests
   */
  constructor(tests) {
    assertTests(tests);
    this._tests = tests;
    this._suite = tests[0].parents[0];
    this._isRunning = false;
    this._currentIndex = -1;
    this._currentTest = null;
    this._nextTest = this._tests[0];
    this._suiteStack = [];
    this._caller = null;
    this._promised = new utils.Promised();
  }

  get tests() {
    return this._tests;
  }

  get suite() {
    return this._suite;
  }

  get env() {
    return this._suite.env;
  }

  /**
   * Remaining tests count depends on if queue is running or not,
   * because queue runs hooks considering next test,
   * and if this test will be splitted we will got error.
   *
   * @returns {Number}
   */
  getRemainingTestsCount() {
    return this._isRunning ? this._tests.length - this._currentIndex - 2 : this._tests.length;
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
      this._caller = new Caller(session);
      this._next()
        .catch(e => this._promised.reject(e));
    });
  }

  /**
   * Splits out another queue out of this
   *
   * @param {Number} fromIndex
   */
  split(fromIndex) {
    const tests = this._tests.splice(fromIndex);
    return new Queue(tests);
  }

  /**
   * Process next item in queue
   */
  _next() {
    return Promise.resolve()
      .then(() => this._moveToNextTest())
      .then(() => {
        if (this._currentTest) {
          return this._caller.callTestWithEachHooks(this._suiteStack, this._currentTest)
            .then(
              () => this._next(),
              () => this._handleHookError()
            )
        } else {
          this._promised.resolve();
        }
      })
  }

  /**
   * Moves to next test.
   * If there is suite change, call needed `before|after` hooks.
   *
   */
  _moveToNextTest() {
    return this._isSuiteChange()
      ? this._handleSuiteChange()
      : this._incrementIndex();
  }

  _isSuiteChange() {
    return !this._currentTest || !this._nextTest || this._currentTest.parent !== this._nextTest.parent;
  }

  _handleSuiteChange() {
    const commonSuite = this._getCommonSuite();
    return this._caller.callAfter(this._suiteStack, commonSuite)
      .then(() => {
        this._incrementIndex();
        if (this._currentTest) {
          return this._caller.callBefore(this._suiteStack, this._currentTest)
            .catch(() => this._handleHookError());
        }
      })
  }

  /**
   * Increments currentIndex and set currentTest / nextTest
   */
  _incrementIndex() {
    if (this._currentIndex > this._tests.length) {
      throw new Error(`Going out of queue: ${this._suite.name}`);
    }
    this._currentIndex++;
    this._currentTest = this._tests[this._currentIndex];
    this._nextTest = this._tests[this._currentIndex + 1];
  }

  /**
   * Increments currentIndex until end of suite reached
   *
   * @param {Suite} suite
   */
  _incrementIndexToLastTestInSuite(suite) {
    const positionInStack = this._suiteStack.findIndex(s => s === suite);
    while (!this._isSuiteEnd(positionInStack)) {
      this._incrementIndex();
    }
  }

  /**
   * Increments index until suite end.
   * Suite end marker is:
   *  - it's suite change point
   *  - common suite is upper than suite for end
   *
   * @param {Number} endSuitePos
   * @returns {boolean}
   */
  _isSuiteEnd(endSuitePos) {
    if (this._isSuiteChange()) {
      const commonSuite = this._getCommonSuite();
      const commonSuitePos = this._suiteStack.findIndex(suite => suite === commonSuite);
      return commonSuitePos < endSuitePos;
    } else {
      return false;
    }
  }

  _handleHookError() {
    this._incrementIndexToLastTestInSuite(this._caller.errorSuite);
    // all needed `after` hooks will be called in this.next()
    return this._next();
  }

  /**
   * Finds common parent suite
   * todo: maybe move to utils
   * todo: optimize for usual cases: 1. sub-suite, 2. same level suite
   *
   * @returns {Suite}
   */
  _getCommonSuite() {
    if (!this._currentTest || !this._nextTest) {
      return null;
    }

    const maxLength = Math.max(
      this._currentTest.parents.length,
      this._nextTest.parents.length
    );
    for (let i = 0; i < maxLength; i++) {
      const p1 = this._currentTest.parents[i];
      const p2 = this._nextTest.parents[i];
      if (p1 != p2) {
        return this._currentTest.parents[i - 1];
      }
    }

    // todo: warn
    return this._currentTest.parent;
  }
};

function assertTests(tests) {
  if (!tests || !tests.length) {
    throw new Error('Queue should be created on non-empty tests array');
  }
}
