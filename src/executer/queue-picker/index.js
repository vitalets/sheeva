/**
 * Takes next queue for execution.
 */

'use strict';

const {config} = require('../../configurator');
const state = require('../../state');
const Shifter = require('./shifter');
const Splitter = require('./splitter');

module.exports = class QueuePicker {
  /**
   * Constructor
   *
   * @param {Set} workers
   */
  constructor(workers) {
    this._targets = Array.from(state.filteredFlatSuitesPerTarget.keys());
    this._workers = workers;
    this._shifter = new Shifter();
    this._splitter = new Splitter(workers);
    this._session = null;
  }

  /**
   * Tries to pick next queue for provided session (target) or for any available target.
   *
   * - if there is passed session, try to get queue for the same target first
   * - if there is no passed session (empty worker) - try to get queue from any available target (by order)
   *
   * @param {Session} [session]
   * @returns {Queue|undefined}
   */
  getNextQueue(session) {
    this._session = session;
    const target = session && session.target;
    return target && this._getForTarget(target) || this._getForAnyTarget();
  }

  /**
   * Does target have pending tests (flat suites)
   *
   * @param {Target} target
   * @returns {Boolean}
   */
  hasPendingTestsForTarget(target) {
    return this._shifter.hasPendingTestsForTarget(target);
  }

  _getForTarget(target) {
    const targets = [target];
    return this._getForTargets(targets);
  }

  _getForAnyTarget() {
    const targets = this._getAvailableTargets();
    return this._getForTargets(targets);
  }

  _getForTargets(targets) {
    return this._tryShiftQueue(targets) || this._trySplitRunningQueues(targets);
  }

  _tryShiftQueue(targets) {
    return this._shifter.tryShift(targets);
  }

  _trySplitRunningQueues(targets) {
    if (config.splitRunningSuites && targets.length) {
      const options = this._getSplitterOptions();
      return this._splitter.trySplit(targets, options);
    }
  }

  _getAvailableTargets() {
    return this._targets.filter(target => !this._isTargetConcurrencyReached(target));
  }

  _isTargetConcurrencyReached(target) {
    return target.concurrency && target.concurrency === this._workers.getWorkersForTarget(target).length;
  }

  _getSplitterOptions() {
    return {
      isSessionStarted: Boolean(this._session && this._session.isStarted)
    };
  }
};
