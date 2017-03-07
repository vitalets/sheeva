/**
 * Candidate for splitting.
 */

const utils = require('../../../utils');
const reporter = require('../../../reporter');
const Queue = require('../../queue');
const {QUEUE_SPLIT} = require('../../../events');
const MIN_REMAINING_TESTS_COUNT = 2;

module.exports = class Candidate {
  constructor(queue) {
    this._queue = queue;
    this._splittedQueue = null;
    this._remainingTestsCount = this._queue.remainingTestsCount;
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
   * Tries to split out new Queue
   *
   * @returns {Queue|undefined}
   */
  trySplit() {
    const testsCount = this._getTestsCountToSplit();
    if (testsCount > 0) {
      this._split(testsCount);
      this._emitSplit();
      return this._splittedQueue;
    }
  }

  _split(testsCount) {
    const fromIndex = this._queue.tests.length - testsCount;
    const splittedTests = this._queue.tests.splice(fromIndex);
    this._splittedQueue = new Queue(splittedTests);
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

  /**
   * Current strategy is simple: just take half of remaining tests
   * todo: make strategy more smart
   */
  _getTestsCountToSplit() {
    return Math.floor(this._remainingTestsCount / 2);
  }

  _emitSplit() {
    reporter.handleEvent(QUEUE_SPLIT, {
      queue: this._queue,
      splittedQueue: this._splittedQueue,
      suites: this._getSplittedSuites(),
      remainingTestsCount: this._remainingTestsCount,
    });
  }

  _getSplittedSuites() {
    const test1 = this._queue.tests[this._queue.tests.length - 1];
    const test2 = this._splittedQueue.tests[0];
    const parents1 = test1 && test1.parents || [];
    const parents2 = test2 && test2.parents || [];
    const commonSuite = utils.getCommonNode(parents1, parents2);
    return commonSuite.parents.concat([commonSuite]);
  }
};
