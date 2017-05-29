'use strict';

/**
 * Picks next queue for execution.
 */

const {config} = require('../../config');
const Queues = require('./queues');
const Splitter = require('./splitter');

module.exports = class Picker {
  /**
   * Constructor
   */
  constructor(workers) {
    this._workers = workers;
    this._queues = new Queues();
    this._splitter = new Splitter(workers);
    this._session = null;
    this._target = null;
  }

  /**
   * Tries to pick next queue for provided session (target) or for any available target.
   *
   * - if there is passed session, try to pick queue for the same target first
   * - if there is no passed session (empty worker) - try to get queue from any available target (by order)
   *
   * @param {Session} [session]
   * @returns {Queue|undefined}
   */
  pickNextQueue(session) {
    this._session = session;
    this._target = session && session.target;
    return this._target && this._pickForSingleTarget(this._target) || this._pickForAvailableTargets();
  }

  /**
   * Returns remaining queues for target
   *
   * @param {Target} target
   * @returns {Array<Queue>}
   */
  getRemainingQueues(target) {
    return this._queues.getRemaining(target);
  }

  _pickForSingleTarget(target) {
    const targets = [target];
    return this._pickForTargets(targets);
  }

  _pickForAvailableTargets() {
    const targets = this._getAvailableTargets();
    return this._pickForTargets(targets);
  }

  _pickForTargets(targets) {
    return this._tryPickWholeQueue(targets) || this._trySplitRunningQueues(targets);
  }

  _tryPickWholeQueue(targets) {
    return this._queues.pickNext(targets);
  }

  _trySplitRunningQueues(targets) {
    if (config.splitSuites && targets.length) {
      const options = this._getSplitterOptions();
      return this._splitter.trySplit(targets, options);
    }
  }

  _getAvailableTargets() {
    return config.targets
      .filter(target => target !== this._target)
      .filter(target => !this._isTargetConcurrencyReached(target));
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
