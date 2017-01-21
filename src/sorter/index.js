/**
 * Flatten and sort suites tree before execution.
 * Sorting is applied so that tests with more before/after hooks count are moved to the beginning,
 * and tests without before/after hooks are moved to the end.
 * This is useful for suite splitting between parallel sessions because splitting for suites with before/after hooks
 * requires that hooks to be executed again.
 *
 * @typedef {Object} FlatSuite
 * @property {Array<Test>} tests
 * @property {Number} baCount max number of before / after hooks
 */

const flattenSort = require('./flatten-sort');

module.exports = class Sorter {
  constructor(envData) {
    this._envData = envData;
    this._envFlatSuites = new Map();
  }

  get envFlatSuites() {
    return this._envFlatSuites;
  }

  run() {
    this._envData.forEach((data, env) => {
      const flatSuites = flattenSort(data.roots);
      this._envFlatSuites.set(env, flatSuites);
    });
    return this;
  }
};

