/**
 * Picks next queue for execution.
 */

const Queue = require('./queue');
const Splitter = require('./splitter');
const PriorityGroups = require('./priority-groups');

module.exports = class QueuePicker {
  /**
   * Constructor
   *
   */
  constructor(state) {
    // this._reporter = options.reporter;
    // this._config = options.config;
    //this._splitter = this._options.config.splitSuites ? new Splitter(this) : null;
    // Flag showing that there are no more queues so we wait for current sessions to finish
    //this._noMoreQueues = false;
    this._state = state;
    this._proirityGroups = new PriorityGroups(state);
  }

  /**
   * Returns next queue.
   * If session provided, try to get queue for that session first.
   *
   * @param {Session} [session]
   */
  getNextQueue(session) {
    const env = session && session.env;
    const flatSuite = env && this._getByEnv(env) || this._getByPriority();
    if (flatSuite) {
      return new Queue(flatSuite.tests);
    }
  }

  /**
   * Returns next suite for suggested env
   *
   * @param {Object} env
   * @returns {FlatSuite|undefined}
   */
  _getByEnv(env) {
    return this._state.get(env).getNextSuite({decreaseSlots: true});
  }

  /**
   * Returns next suite if no env suggested (e.g. empty slot)
   *
   * @returns {FlatSuite|undefined}
   */
  _getByPriority() {
    return this._proirityGroups.getNextSuite();
  }
};
