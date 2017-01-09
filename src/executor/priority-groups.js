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

  getNextSuite() {
    for (let group of this._groups) {
      const flatSuite = getFromGroup(group);
      if (flatSuite) {
        return flatSuite;
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
};

function getFromGroup(group) {
  group.sort(slotsSorter);
  for (let envState of group) {
    const flatSuite = envState.getNextSuite({increaseSlots: true});
    if (flatSuite) {
      return flatSuite;
    }
  }
}

function slotsSorter(a, b) {
  return a.slots - b.slots;
}
