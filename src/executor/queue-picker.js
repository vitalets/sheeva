/**
 * Picks queues from envs by priority. Can also split queues if `config.splitSuites` = true.
 */

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
   * Returns next queue
   *
   * @param {Session} [session]
   */
  getNextQueue(session) {
    const env = session && session.env;
    return env && this._getByEnv(env) || this._getByPriority();
  }

  /**
   * Returns next queue for suggested env
   *
   * @param {Object} env
   * @returns {Queue|undefined}
   */
  _getByEnv(env) {
    return this._state.get(env).getNextQueue({decreaseSlots: true});
  }

  /**
   * Returns next queue if no env suggested (e.g. empty slot)
   *
   * @returns {Queue|undefined}
   */
  _getByPriority() {
    return this._proirityGroups.getNextQueue();
  }
};
