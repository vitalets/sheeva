/**
 * Manage current test position
 */

const utils = require('../../utils');

module.exports = class Cursor {
  /**
   * Constructor
   *
   * @param {Array} tests
   */
  constructor(tests) {
    this._tests = tests;
    this._currentIndex = -1;
    this._currentTest = null;
    this._nextTest = this._tests[0];
  }

  get tests() {
    return this._tests;
  }

  get currentTest() {
    return this._currentTest;
  }

  get remainingTestsCount() {
    return this._tests.length - this._currentIndex - 1;
  }

  moveToNextText() {
    if (this._currentIndex > this._tests.length) {
      const lastTest = this._tests[this._tests.length - 1];
      throw new Error(`Going out of queue in ${lastTest.parents[0].name}`);
    }
    this._currentIndex++;
    this._currentTest = this._tests[this._currentIndex];
    this._nextTest = this._tests[this._currentIndex + 1];
  }

  moveToSuiteEnd(suite) {
    while (!this._isSuiteEnd(suite)) {
      this.moveToNextText();
    }
  }

  isSuiteBoundary() {
    return !this._currentTest || !this._nextTest || this._currentTest.parent !== this._nextTest.parent;
  }

  /**
   * Finds nearest common parent suite of currentTest and nextTest
   *
   * @returns {Suite|null}
   */
  findCommonSuiteWithNextTest() {
    return utils.getNearestCommonParent(this._currentTest, this._nextTest);
  }

  /**
   * Suite end marker is:
   *  - it's suite boundary
   *  - common-suite is parent of end-suite
   *
   * Imagine boundary tests have parents:
   *
   * test1: A B C
   * test2: A B D
   *
   * Nearest common suite is: B
   * If end-suite is A, we should continue, as test2 still inside A
   * If end-suite is B, we should continue, as test2 still inside B
   * If end-suite is C, we should stop, as test2 is out of C
   *
   * @param {Suite} suite
   * @returns {Boolean}
   */
  _isSuiteEnd(suite) {
    if (this.isSuiteBoundary()) {
      const commonSuite = this.findCommonSuiteWithNextTest();
      return commonSuite ? suite.parents.some(parent => parent === commonSuite) : true;
    } else {
      return false;
    }
  }
};
