/**
 * Queue - flat sequence of tests.
 * Current index moves test by test executing them with hooks.
 * In case of error in hook, pointer moves to the end of suite.
 *
 * @type {Queue}
 */

const Promised = require('../utils/promised');

module.exports = class Queue {
  /**
   * Constructor
   *
   * @param {Array} tests
   */
  constructor(tests) {
    // todo: make private fields
    this.tests = tests;
    this.suite = tests.length ? tests[0].parents[0] : null;
    this.currentIndex = -1;
    this.currentTest = null;
    this.nextTest = this.tests[0];
    this.suiteStack = [];
    this.promised = new Promised();
  }

  isEmpty() {
    return this.tests.length === 0;
  }

  getRemainingCount() {
    return this.tests.length - this.currentIndex - 1;
  }

  /**
   * Runs queue
   *
   * @param {Caller} caller
   * @returns {Promise}
   */
  run(caller) {
    return this.promised.call(() => {
      this.caller = caller;
      this.next()
        .catch(e => this.promised.reject(e));
    });
  }

  /**
   * Process next item in queue
   */
  next() {
    return Promise.resolve()
      .then(() => this.moveToNextTest())
      .then(() => {
        if (this.currentTest) {
          return this.caller.callTest(this.suiteStack, this.currentTest)
            .then(() => this.next(), () => this.handleHookError())
        } else {
          this.promised.resolve();
        }
      })
  }

  /**
   * Moves to next test.
   * If there is suite change, call needed `before|after` hooks.
   *
   */
  moveToNextTest() {
    return this.isSuiteChange()
      ? this.handleSuiteChange()
      : this.incrementIndex();
  }

  isSuiteChange() {
    return !this.currentTest || !this.nextTest || this.currentTest.parent !== this.nextTest.parent;
  }

  handleSuiteChange() {
    const commonSuite = this.getCommonSuite();
    return this.caller.callAfter(this.suiteStack, commonSuite)
      .then(() => {
        this.incrementIndex();
        if (this.currentTest) {
          return this.caller.callBefore(this.suiteStack, this.currentTest)
            .catch(() => this.handleHookError());
        }
      })
  }

  /**
   * Increments currentIndex and set currentTest / nextTest
   */
  incrementIndex() {
    if (this.currentIndex > this.tests.length) {
      throw new Error(`Going out of queue: ${this.suite.name}`);
    }
    this.currentIndex++;
    this.currentTest = this.tests[this.currentIndex];
    this.nextTest = this.tests[this.currentIndex + 1];
  }

  /**
   * Increments currentIndex until end of suite reached
   *
   * @param {Suite} suite
   */
  incrementIndexToLastTestInSuite(suite) {
    const positionInStack = this.suiteStack.findIndex(s => s === suite);
    while (!this.isSuiteEnd(positionInStack)) {
      this.incrementIndex();
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
  isSuiteEnd(endSuitePos) {
    if (this.isSuiteChange()) {
      const commonSuite = this.getCommonSuite();
      const commonSuitePos = this.suiteStack.findIndex(suite => suite === commonSuite);
      return commonSuitePos < endSuitePos;
    } else {
      return false;
    }
  }

  handleHookError() {
    this.incrementIndexToLastTestInSuite(this.caller.errorSuite);
    // all needed `after` hooks will be called in this.next()
    return this.next();
  }

  /**
   * Splits out another queue out of this
   *
   * @param {Number} fromIndex
   */
  split(fromIndex) {
    const tests = this.tests.splice(fromIndex);
    return new Queue(tests);
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
