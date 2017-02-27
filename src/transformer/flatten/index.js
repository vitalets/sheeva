/**
 * Flatten and sort suites tree before execution.
 * Sorting is applied so that tests with more before/after hooks count are moved to the beginning,
 * and tests without before/after hooks are moved to the end.
 * This is useful for suite splitting between parallel sessions because splitting for suites with before/after hooks
 * requires that hooks to be executed again.
 *
 */

const SuiteFlattener = require('./suite-flattener');

module.exports = class Flatten {
  constructor() {
    this._envFlatSuites = new Map();
  }

  get result() {
    return this._envFlatSuites;
  }

  run(envData) {
    envData.forEach((data, env) => {
      const flatSuites = new SuiteFlattener({children: data.topSuites}).flatten();
      this._envFlatSuites.set(env, flatSuites);
      this._calcTestsCount(env, flatSuites);
    });
  }

  _calcTestsCount(env, flatSuites) {
    env.testsCount = flatSuites.reduce((res, flatSuite) => {
      return res + flatSuite.tests.length;
    }, 0);
  }
};
