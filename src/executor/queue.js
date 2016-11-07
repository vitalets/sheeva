/**
 * Queue - flat sequence of tests.
 * During executioon pointer moves test by test in normal flow.
 * In case of error in hook, pointer moves to end of suite.
 *
 * @type {Queue}
 */

const events = require('../events');

module.exports = class Queue {
  /**
   * Constructor
   *
   * @param {Suite} suite
   */
  constructor(suite) {
    this.suite = suite;
    this.tests = flatten(suite);
    this.currentIndex = -1;
    this.currentTest = null;
    this.nextTest = this.tests[0];
    // stack of started suites (where before hook was called)
    this.suiteStack = [];
    // stack of called beforeEach
    this.beforeEachStack = [];
    this.onEvent = () => {};
    this.errorSuite = null;
    this.error = null;
  }

  run() {
    this.onEvent(events.QUEUE_START);
    this.next();
  }

  /**
   * Process next item in queue
   */
  next() {
    // console.log('called next');
    // console.log('currentIndex', this.currentIndex);
    // console.log('currentTest', this.currentTest && this.currentTest.name);
    // console.log('nextTest', this.nextTest && this.nextTest.name);

    this.moveToNextTest();
    if (this.currentTest) {
      this.executeTest();
      this.handleHookError();
      this.next();
    } else {
      this.onEvent(events.QUEUE_END, this.suite);
    }
  }

  /**
   * Increments currentIndex and set currentTest / nextTest
   */
  incrementIndex() {
    this.currentIndex++;
    this.currentTest = this.nextTest;
    this.nextTest = this.tests[this.currentIndex + 1];
  }

  /**
   * Increments currentIndex until end of suite reached
   *
   * @param {Suite} suite
   */
  incrementIndexUntilSuiteEnd(suite) {
    const positionInStack = this.suiteStack.findIndex(s => s === suite);
    while (!this.isSuiteEnd(positionInStack)) {
      this.incrementIndex();
    }
  }

  isSuiteChange() {
    return !this.currentTest || !this.nextTest || this.currentTest.parent !== this.nextTest.parent;
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
  isSuiteEnd(endSuitePos) {
    if (this.isSuiteChange()) {
      const commonSuite = this.getCommonSuite();
      const commonSuitePos = this.suiteStack.findIndex(suite => suite === commonSuite);
      return commonSuitePos < endSuitePos;
    } else {
      return false;
    }
  }

  /**
   * Moves to next test.
   * If there is suite change, call needed `before|after` hooks.
   *
   */
  moveToNextTest() {
    if (this.isSuiteChange()) {
      this.handleSuiteChange();
    } else {
      this.incrementIndex();
    }
  }

  handleSuiteChange() {
    const commonSuite = this.getCommonSuite();
    this.executeAfter(commonSuite);
    this.incrementIndex();
    if (this.currentTest) {
      this.executeBefore();
      this.handleHookError();
    }
  }

  handleHookError() {
    if (this.errorSuite) {
      this.incrementIndexUntilSuiteEnd(this.errorSuite);
      // all needed `after` hooks will be called in moveToNextTest
      this.moveToNextTest();
    }
  }

  /**
   * Executes all `before` hooks for current test
   * starting from last suite in suiteStack
   */
  executeBefore() {
    const lastSuite = this.suiteStack[this.suiteStack.length - 1];
    const lastSuiteIndex = this.currentTest.parents.findIndex(suite => suite === lastSuite);
    for (let i = lastSuiteIndex + 1; i < this.currentTest.parents.length; i++) {
      const suite = this.currentTest.parents[i];
      this.suiteStack.push(suite);
      this.onEvent(events.SUITE_START, {suite});
      const error = this.executeHooksArray(suite, 'before');
      if (error) {
        this.errorSuite = suite;
        this.error = error;
        break;
      }
    }
  }

  /**
   * Executes all `beforeEach` hooks for current test
   *
   * @returns {*}
   */
  executeBeforeEach() {
    this.beforeEachStack.length = 0;
    for (let i = 0; i < this.suiteStack.length; i++) {
      const suite = this.suiteStack[i];
      this.beforeEachStack.push(suite);
      const error = this.executeHooksArray(suite, 'beforeEach');
      if (error) {
        this.errorSuite = suite;
        this.error = error;
        break;
      }
    }
  }

  /**
   * Executes:
   * - `beforeEach` hooks
   * - `test` itself
   * - `afterEach` hooks
   *
   * @returns {Suite|undefined}
   */
  executeTest() {
    const test = this.currentTest;
    this.executeBeforeEach();
    if (!this.errorSuite) {
      this.onEvent(events.TEST_START, {test});
      try {
        this.currentTest.fn();
        this.onEvent(events.TEST_END, {test});
      } catch (error) {
        this.onEvent(events.TEST_END, {test, error});
      }
    }
    this.executeAfterEach();
  }

  /**
   * Executes all afterEach from stack
   *
   * @returns {Suite|undefined}
   */
  executeAfterEach() {
    for (let i = this.beforeEachStack.length - 1; i >= 0; i--) {
      const suite = this.beforeEachStack[i];
      const error = this.executeHooksArray(suite, 'afterEach');
      if (error) {
        this.errorSuite = suite;
        this.error = error;
      }
    }
    this.beforeEachStack.length = 0;
  }

  /**
   * Executes all `after` hook until stopSuite reached (not including stopSuite!)
   *
   * @param {Suite} stopSuite
   * @returns {*}
   */
  executeAfter(stopSuite) {
    const index = this.suiteStack.findIndex(suite => suite === stopSuite);
    const tailCount = this.suiteStack.length - (index + 1);
    const suites = this.suiteStack.splice(-tailCount);
    for (let i = suites.length - 1; i >= 0; i--) {
      const suite = suites[i];
      let beforeError;
      if (this.errorSuite && this.errorSuite === suite) {
        beforeError = this.error;
        this.errorSuite = null;
        this.error = null;
      }
      const afterError = this.executeHooksArray(suite, 'after');
      // consider before error more important
      const error = beforeError || afterError;
      // errors in after hooks do not influence on queue
      // so they just reported
      this.onEvent(events.SUITE_END, {suite, error});
    }
  }

  executeHooksArray(suite, type) {
    const hooks = suite[type];
    for (let index = 0; index < hooks.length; index++) {
      const hook = hooks[index];
      this.onEvent(events.HOOK_START, {suite, type, index});
      try {
        hook();
        this.onEvent(events.HOOK_END, {suite, type, index});
      } catch (error) {
        this.onEvent(events.HOOK_END, {suite, type, index, error});
        return error;
      }
    }
  }

  /**
   * Finds common parent suite
   * todo: optimize for usual cases: 1. sub-suite, 2. same level suite
   *
   * @returns {Suite}
   */
  getCommonSuite() {
    if (!this.currentTest || !this.nextTest) {
      return null;
    }

    const maxLength = Math.max(
      this.currentTest.parents.length,
      this.nextTest.parents.length
    );
    for (let i = 0; i < maxLength; i++) {
      const p1 = this.currentTest.parents[i];
      const p2 = this.nextTest.parents[i];
      if (p1 != p2) {
        return this.currentTest.parents[i - 1];
      }
    }

    // todo: warn
    return this.currentTest.parent;
  }
};

function flatten(suite) {
  const filterFn = suite.hasOnly
    ? item => item.hasOnly || item.only
    : () => true;
  const subSuites = suite.suites
    .filter(filterFn)
    .reduce((res, item) => res.concat(flatten(item)), []);
  return []
    .concat(suite.tests.filter(filterFn))
    .concat(subSuites)
}




