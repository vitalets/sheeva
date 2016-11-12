/**
 * Queue - flat sequence of tests.
 * Current index moves test by test executing them with hooks.
 * In case of error in hook, pointer moves to the end of error suite.
 *
 * @type {Queue}
 */

const utils = require('../utils');
const events = require('../events');

module.exports = class Queue {
  /**
   * Constructor
   *
   * @param {Suite} suite
   */
  constructor(suite) {
    // todo: make private fields
    this.suite = suite;
    this.tests = flatten(this.suite);
    this.currentIndex = -1;
    this.currentTest = null;
    this.nextTest = this.tests[0];
    // stack of started suites (where before hook was called)
    this.suiteStack = [];
    // stack of called beforeEach
    this.beforeEachStack = [];
    this.errorSuite = null;
    this.error = null;
    this.promised = new utils.Promised();
  }

  isEmpty() {
    return this.tests.length === 0;
  }

  run(session) {
    return this.promised.call(() => {
      this.session = session;
      this.next();
    });
  }

  emit(event, data = {}) {
    this.session.emit(event, data);
  }

  /**
   * Process next item in queue
   */
  next() {
    this.moveToNextTest();
    if (this.currentTest) {
      this.executeTest();
      this.handleHookError();
      this.next();
    } else {
      this.promised.resolve();
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
      this.emit(events.SESSION_SUITE_START, {suite});
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
    test.createContext();
    this.executeBeforeEach();
    if (!this.errorSuite) {
      this.emit(events.TEST_START, {test});
      try {
        const {fn, context} = test;
        this.executeFn({fn, context, test});
        this.emit(events.TEST_END, {test});
      } catch (error) {
        this.emit(events.TEST_END, {test, error});
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
    const suites = this.suiteStack.splice(index + 1);
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
      this.emit(events.SESSION_SUITE_END, {suite, error});
    }
  }

  executeHooksArray(suite, hookType) {
    const hooks = suite[hookType];
    // context exists only for beforeEach/afterEach hooks
    const context = ['beforeEach', 'afterEach'].indexOf(hookType) >= 0
      ? this.currentTest.context
      : null;

    return hooks.reduce((res, hook, index) => {
      return res
        .then(() => {
          this.emit(events.HOOK_START, {suite, hookType, index});
          return this.executeFn({fn, suite, hookType, context});
        })
        .then(
          () => this.emit(events.HOOK_END, {suite, hookType, index}),
          error => {
            this.emit(events.HOOK_END, {suite, hookType, index, error});
            return Promise.reject(error);
          }
        )
    }, Promise.resolve());
    // for (let index = 0; index < hooks.length; index++) {
    //   const fn = hooks[index];
    //   this.emit(events.HOOK_START, {suite, hookType, index});
    //   try {
    //     this.executeFn({fn, suite, hookType, context});
    //     this.emit(events.HOOK_END, {suite, hookType, index});
    //   } catch (error) {
    //     this.emit(events.HOOK_END, {suite, hookType, index, error});
    //     return error;
    //   }
    // }
  }

  executeFn(params) {
    const wrapFn = this.session.createWrapFn(params);
    return Promise.resolve().then(() => wrapFn());
  }

  /**
   * Finds common parent suite
   * todo: maybe move to utils
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
  const subTests = suite.suites.reduce((res, suite) => res.concat(flatten(suite)), []);
  return suite.tests.concat(subTests);
}
