/**
 * Candidate for splitting.
 */

const reporter = require('../../../reporter');
const Queue = require('../queue');
const {QUEUE_SPLIT} = require('../../../events');
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
    const splittedTests = this._getSplittedTests();
    const splittedQueue = splittedTests.length ? new Queue(splittedTests) : null;
    if (splittedQueue) {
      this._emitSplit(splittedQueue);
    }
    return splittedQueue;
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

  _getSplittedTests() {
    const splitCount = Math.floor(this._remainingTestsCount / 2);
    const fromIndex = this._queue.tests.length - splitCount;
    return this._queue.tests.splice(fromIndex);
  }

  _emitSplit(splittedQueue) {
    reporter.handleEvent(QUEUE_SPLIT, {
      queue: this._queue,
      splittedQueue,
      suites: [],
      remainingTestsCount: this._remainingTestsCount,
    });
  }
};
