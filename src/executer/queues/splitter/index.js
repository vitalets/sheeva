/**
 * Splitter for running queues
 */

const reporter = require('../../../reporter');
const State = require('./state');
const Candidate = require('./candidate');
const {QUEUE_SPLIT} = require('../../../events');

module.exports = class Splitter {
  constructor(slots) {
    this._slots = slots;
    this._state = new State();
    this._candidates = [];
    this._stateOptions = {};
  }

  /**
   * Tries split the longest running queue in specified envs
   *
   * @param {Array<Env>} envs
   * @param {Object} options
   * @param {Boolean} options.isSessionStarted
   */
  trySplit(envs, options = {}) {
    // require('../../configurator').config.log(`trying to split ${envs.length} envs with isSessionStarted = ${options.isSessionStarted}`);
    this._stateOptions = {isSessionStarted: options.isSessionStarted};
    const splittableEnvs = this._extractSplittableEnvs(envs);
    this._createCandidates(splittableEnvs);
    this._filterCandidates();
    this._sortCandidates();
    return this._trySplit();
  }

  _extractSplittableEnvs(envs) {
    const arr = envs.filter(env => this._state.canSplit(env, this._stateOptions));
    return new Set(arr);
  }

  _createCandidates(splittableEnvs) {
    this._candidates = this._slots.toArray()
      .filter(slot => Boolean(slot.queue))
      .filter(slot => splittableEnvs.has(slot.queue.env))
      .map(slot => new Candidate(slot.queue));
  }

  _filterCandidates() {
    this._candidates = this._candidates.filter(candidate => candidate.isSplittable);
  }

  _sortCandidates() {
    this._candidates.sort((a, b) => a.remainingTime - b.remainingTime);
  }

  _trySplit() {
    for (let candidate of this._candidates) {
      const queue = candidate.trySplit();
      if (queue) {
        // this._emitSplit(candidate, queue);
        return queue;
      } else {
        this._state.setCantSplit(candidate.env, this._stateOptions);
      }
    }
  }

  _emitSplit(item, queue) {
    reporter.handleEvent(SUITE_SPLIT, {
      suite: item.queue.suite,
      queue: item.queue,
      remainingTestsCount: item.remainingTestsCount,
      splittedTestsCount: splittedQueue.tests.length,
    });
  }
};
