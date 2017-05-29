'use strict';

/**
 * Tries to split running queues for parallelization
 */

const State = require('./state');
const Candidate = require('./candidate');

module.exports = class Splitter {
  constructor(workers) {
    this._workers = workers;
    this._state = new State();
    this._candidates = [];
    this._stateOptions = {};
  }

  /**
   * Tries to split the longest running queue in specified targets
   *
   * @param {Array<Target>} targets
   * @param {Object} options
   * @param {Boolean} options.isSessionStarted
   */
  trySplit(targets, options = {}) {
    this._stateOptions = {isSessionStarted: options.isSessionStarted};
    const splittableTargets = this._extractSplittableTargets(targets);
    this._createCandidates(splittableTargets);
    this._filterCandidates();
    this._sortCandidates();
    return this._trySplit();
  }

  _extractSplittableTargets(targets) {
    const arr = targets.filter(target => this._state.canSplit(target, this._stateOptions));
    return new Set(arr);
  }

  _createCandidates(splittableTargets) {
    this._candidates = this._workers.toArray()
      .filter(worker => Boolean(worker.queue))
      .filter(worker => splittableTargets.has(worker.queue.target))
      .map(worker => new Candidate(worker.queue));
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
        return queue;
      } else {
        this._setCantSplit(candidate.target);
      }
    }
  }

  _setCantSplit(target) {
    this._state.setCantSplit(target, this._stateOptions);
  }
};
