/**
 * Groups of envs by priority
 * Example:
 *  PRIORITY:   ENVS:
 *  0           [env1]
 *  1           [env2, env3]
 *  undefined   [env4, env5]
 */

module.exports = class PriorityGroups {
  /**
   * Constructor
   *
   * @param {Map} state
   */
  constructor(state) {
    this._groups = [];
    this._initGroups(state);
  }

  getNextQueue() {
    for (let group of this._groups) {
      const queue = this._getFromGroup(group);
      if (queue) {
        return queue;
      }
    }
  }

  _initGroups(state) {
    const tempGroups = new Map();
    state.forEach((envState, env) => {
      const priority = env.priority === undefined ? +Infinity : env.priority;
      const group = tempGroups.get(priority) || [];
      group.push(env);
      tempGroups.set(priority, group);
    });
    tempGroups.forEach((envs, priority) => {
      this._groups.push({envs, priority});
    });
    this._groups = this._groups
      .sort((a, b) => a.priority - b.priority)
      .map(group => {
        return group.envs.map(env => state.get(env));
      });
  }

  _getFromGroup(group) {
    group.sort((a, b) => a.slots - b.slots);
    for (let envState of group) {
      const queue = envState.getNextQueue({increaseSlots: true});
      if (queue) {
        return queue;
      }
    }
  }
};
