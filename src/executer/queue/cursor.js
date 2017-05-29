'use strict';

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
    this._setCurrentIndex(this._currentIndex + 1);
  }

  /**
   * Moves cursor to the last test of provided suite.
   *
   * @param {Suite} suite
   */
  moveToSuiteEnd(suite) {
    while (!this._isSuiteEnd(suite)) {
      this.moveToNextText();
    }
  }

  /**
   * Moves cursor to the last test of queue.
   */
  moveToQueueEnd() {
    this._setCurrentIndex(this._tests.length - 1);
  }

  /**
   * Returns true if current test is left to suite boundary.
   *
   * @returns {boolean}
   */
  isSuiteBoundary() {
    return !this._currentTest || !this._nextTest || this._currentTest.parent !== this._nextTest.parent;
  }

  /**
   * Finds nearest common parent suite of currentTest and nextTest
   *
   * @returns {Suite|null}
   */
  findCommonSuiteWithNextTest() {
    const parents1 = this._currentTest && this._currentTest.parents || [];
    const parents2 = this._nextTest && this._nextTest.parents || [];
    return utils.getCommonNode(parents1, parents2);
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

  _setCurrentIndex(index) {
    // not this._tests.length - 1 as we move cursor to +1 test to call after hooks for the last test
    const maxIndex = this._tests.length;
    if (index > maxIndex) {
      const filename = this._tests[0].parents[0].name;
      throw new Error(`Going out of queue: set index = ${index}, but max = ${maxIndex} in ${filename}`);
    }
    this._currentIndex = index;
    this._currentTest = this._tests[this._currentIndex];
    this._nextTest = this._tests[this._currentIndex + 1];
  }
};
