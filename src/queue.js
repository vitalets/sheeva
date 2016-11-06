/**
 * Queue - flat sequence of tests
 *
 * @type {Queue}
 */

const utils = require('./utils');
const executor = require('./executor');
const events = require('./events');

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
    // stack of started suites
    this.suiteStack = [];
    // stack of called beforeEach
    this.beforeEachStack = [];
    this.onEvent = null;
  }

  run() {
    this.emit(events.QUEUE_START);
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
      this.next();
    } else {
      this.emit(events.QUEUE_END, this.suite);
    }
  }

  /**
   * Moves currentIndex to the next test
   */
  moveCurrentIndex() {
    this.currentIndex++;
    this.currentTest = this.nextTest;
    this.nextTest = this.tests[this.currentIndex + 1];
  }

  /**
   * Moves currentIndex to the last test of suite
   *
   * @param {Suite} suite
   */
  // moveToSuiteEnd(suite) {
  //   while (!this.isSuiteEnd(suite)) {
  //     this.move();
  //   }
  // }

  isSuiteChange() {
    return !this.currentTest || !this.nextTest || this.currentTest.parent !== this.nextTest.parent;
  }

  // isSuiteEnd(suite) {
  //   if (this.isSuiteChange()) {
  //     const {suitesUp} = this.getSuiteChangeInfo();
  //     return suitesUp.some(s => s === suite);
  //   } else {
  //     return false;
  //   }
  // }

  /**
   * Moves to next test.
   * If there is suite change, call needed `before|after` hooks.
   *
   */
  moveToNextTest() {
    if (this.isSuiteChange()) {
      const commonSuite = this.getCommonSuite();
      this.executeAfter(commonSuite);
      this.moveCurrentIndex();
      if (this.currentTest) {
        this.executeBefore();
      }
    } else {
      this.moveCurrentIndex();
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
      this.emit(events.SUITE_START, {suite});
      const error = this.executeHooksArray(suite, 'before');
      if (error) {
        return suite;
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
        return suite;
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
    const bErrorSuite = this.executeBeforeEach();
    const test = this.currentTest;
    if (!bErrorSuite) {
      this.emit(events.TEST_START, {test});
      try {
        this.currentTest.fn();
        this.emit(events.TEST_END, {test});
      } catch (error) {
        this.emit(events.TEST_END, {test, error});
      }
    }
    const aErrorSuite = this.executeAfterEach();
    return aErrorSuite || bErrorSuite;
  }

  /**
   * Executes all afterEach from stack
   * On error returns top error suite
   *
   * @returns {Suite|undefined}
   */
  executeAfterEach() {
    let errorSuite = null;
    for (let i = this.beforeEachStack.length - 1; i >= 0; i--) {
      const suite = this.beforeEachStack[i];
      const error = this.executeHooksArray(suite, 'afterEach');
      if (error) {
        errorSuite = suite;
      }
    }
    this.beforeEachStack.length = 0;
    return errorSuite;
  }

  /**
   * Executes all `after` hook until stopSuite reached
   *
   * @param {Suite} stopSuite
   * @returns {*}
   */
  executeAfter(stopSuite) {
    const index = this.suiteStack.findIndex(suite => suite === stopSuite);
    const tailCount = this.suiteStack.length - index + 1;
    const suites = this.suiteStack.splice(-tailCount);
    let errorSuite = null;
    for (let i = suites.length - 1; i >= 0; i--) {
      const suite = suites[i];
      const error = this.executeHooksArray(suite, 'after');
      this.emit(events.SUITE_END, {suite, error});
      if (error) {
        errorSuite = suite;
      }
    }
    return errorSuite;
  }

  executeHooksArray(suite, type) {
    const hooks = suite[type];
    hooks.forEach((hook, index) => {
      this.emit(events.HOOK_START, {suite, type, index});
      try {
        hook();
        this.emit(events.HOOK_END, {suite, type, index});
      } catch (error) {
        this.emit(events.HOOK_END, {suite, type, index, error});
        return error;
      }
    });
  }

  emit(event, data) {
    if (this.onEvent) {
      // todo: move to next tick to do main things first
      // process.nextTick(() => {
      //   this.onEvent.call(null, event, data);
      // });
      this.onEvent.call(null, event, data);
    }
  }
  // endSuite(suite) {
  //   // move to last test in suite
  //   // common parent
  // }

  /**
   * Finds common parent suite
   * todo: optimize for usual cases: 1. sub-suite, 2. same level suite
   *
   * @returns {Suite}
   */
   getCommonSuite() {
     return utils.getCommonParent(this.currentTest, this.nextTest);
   }
};

function flatten(suite) {
  const subSuites = suite.suites.reduce((res, item) => res.concat(flatten(item)), []);
  return []
    .concat(suite.tests)
    .concat(subSuites)
}




