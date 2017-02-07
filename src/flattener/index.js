/**
 * Flatten and sort suites tree before execution.
 * Sorting is applied so that tests with more before/after hooks count are moved to the beginning,
 * and tests without before/after hooks are moved to the end.
 * This is useful for suite splitting between parallel sessions because splitting for suites with before/after hooks
 * requires that hooks to be executed again.
 *
 */

const SuiteFlattener = require('./suite-flattener');

module.exports = class Flattener {
  constructor() {
    this._envFlatSuites = new Map();
  }

  get envFlatSuites() {
    return this._envFlatSuites;
  }

  run(envData) {
    envData.forEach((data, env) => {
      const flatSuites = new SuiteFlattener({children: data.fileSuites}).flatten();
      this._envFlatSuites.set(env, flatSuites);
    });
  }
};
