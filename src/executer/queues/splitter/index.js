/**
 * Splitter of running queues.
 * Internally operates splittable items (see typedef).
 *
 * @typedef {Object} SplittableItem
 * @property {Queue} queue
 * @property {Env} env
 * @property {Number} remainingTestsCount
 * @property {Number} remainingTime
 *
 */

const State = require('./state');

const MIN_REMAINING_TESTS_COUNT = 2;

module.exports = class Splitter {
  constructor(slots) {
    this._slots = slots;
    this._state = new State();
    this._splittableEnvs = null;
    this._splittableItems = null;
  }

  /**
   * Tries split any of passed envs
   * - filter splittable envs
   * - intersect with running slots
   * - sort by remaining time
   * - try split the longest queue
   *
   * @param {Array<Env>} envs
   * @param {Object} options
   * @param {Boolean} options.isSessionStarted
   */
  trySplit(envs, options = {}) {
    this._state.forStartedSession = options.isSessionStarted;
    this._setSplittableEnvs(envs);
    this._setSplittableItems();
    this._sortByRemainingTime();
    return this._trySplitItems();
  }

  _setSplittableEnvs(envs) {
    this._splittableEnvs = this._state.filterSplittableEnvs(envs);
  }

  _setSplittableItems() {
    this._splittableItems = this._slots.getWithQueues()
      .filter(slot => {
        return this._splittableEnvs.has(slot.env)
      })
      .filter(slot => {
        return slot.queue.getRemainingTestsCount() >= MIN_REMAINING_TESTS_COUNT;
      })
      .map(slot => createSplittableItem(slot))
  }

  _sortByRemainingTime() {
    this._splittableItems.sort((a, b) => a.remainingTime - b.remainingTime);
  }

  _trySplitItems() {
    for (let item of this._splittableItems) {
      const splittedQueue = this._trySplitItem(item);
      if (splittedQueue) {
        return splittedQueue;
      } else {
        this._state.markUnsplittable(item.env);
      }
    }
  }

  _trySplitItem(item) {
    const queue = item.queue;
    const splitCount = Math.floor(item.remainingTestsCount / 2);
    const fromIndex = queue.tests.length - splitCount;
    // console.log(`${item.env.id}: splitted ${splitCount} of ${item.remainingTestsCount} test(s) in ${queue.suite.name}`);
    return queue.split(fromIndex);
  }
};

function createSplittableItem(slot) {
  return {
    queue: slot.queue,
    env: slot.env,
    remainingTestsCount: slot.queue.getRemainingTestsCount(),
    // as first approach use getRemainingTestsCount as remaining time
    remainingTime: slot.queue.getRemainingTestsCount(),
  };
}
