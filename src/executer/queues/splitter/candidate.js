/**
 * Candidate for splitting.
 */

const Queue = require('../queue');
const MIN_REMAINING_TESTS_COUNT = 2;

module.exports = class Candidate {
  constructor(queue) {
    this._queue = queue;
    this._remainingTestsCount = this._queue.getRemainingTestsCount();
    this._isSplittable = this._hasEnoughRemainingTests();
    this._remainingTime = this._calcRemainingTime();
  }

  get isSplittable() {
    return this._isSplittable;
  }

  get env() {
    return this._queue.env;
  }

  get remainingTime() {
    return this._remainingTime;
  }

  /**
   * Tries to split
   * Current strategy is simple: just take half of remaining tests
   * todo: make strategy more smart
   *
   * @returns {Queue}
   */
  trySplit() {
    const splitCount = Math.floor(this._remainingTestsCount / 2);
    const fromIndex = this._queue.tests.length - splitCount;
    // console.log(`${item.env.id}: splitted ${splitCount} of ${item.remainingTestsCount} test(s) in ${queue.suite.name}`);
    const splittedTests = this._queue.tests.splice(fromIndex);
    return new Queue(splittedTests);
  }

  _hasEnoughRemainingTests() {
    return this._remainingTestsCount >= MIN_REMAINING_TESTS_COUNT;
  }

  /**
   * As first rough approach use remainingTestsCount as value for remainingTime
   */
  _calcRemainingTime() {
    return this._remainingTestsCount;
  }
};
