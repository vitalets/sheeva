'use strict';

/**
 * Converts suite to one or several flatSuites by flattening children.
 * Also sort suites by count of `before|after` hooks.
 *
 * 1. Flatten all child sub suites to array of flatSuites
 * 2. Flatten all child tests to 1 flatSuite
 * 3. Concat results of 1 and 2
 * 4. Sort by count of `before|after` hooks (max on top)
 * 5.
 *   a. if original suite has before|after hooks, returns single flatSuite:
 *      all tests are concated and suiteHooksCount set to MAX count of before|after hooks
 *
 *   b. if original suite does not have before|after hooks, returns array of flat suites:
 *      When it occurs for file suite it is basically `file splitting` because each sub-suite
 *      can be sorted individually to beginning or end of target suites (depending on it's before/after count)
 *
 * @typedef {Object} FlatSuite
 * @property {Array<Test>} tests
 * @property {Number} suiteHooksCount MAX number of suite-level hooks (before / after)
 * @property {Number} index
 */


const {config} = require('../../configurator');

module.exports = class SuiteFlattener {
  /**
   * Constructor
   *
   * @param {Suite} suite
   */
  constructor(suite) {
    this._suite = suite;
    this._suiteHooksCount = 0;
    this._flatSuites = [];
  }

  flatten() {
    this._calcSuiteHooksCount();
    this._flattenSubSuites();
    this._flattenTests();
    this._filterEmpty();
    this._sortBySuiteHooksCount();
    return this._needSingleFlatSuite() ? this._mergeAsSingleFlatSuite() : this._flatSuites;
  }

  _calcSuiteHooksCount() {
    const {before, after} = this._suite;
    const beforeHooksCount = before && before.length ? 1 : 0;
    const afterHooksCount = after && after.length ? 1 : 0;
    this._suiteHooksCount = beforeHooksCount + afterHooksCount;
  }

  _flattenSubSuites() {
    const subSuites = this._suite.children.filter(item => item.isSuite);
    subSuites.forEach(suite => this._flattenSubSuite(suite));
  }

  _flattenSubSuite(suite) {
    const subFlatSuites = new SuiteFlattener(suite).flatten();
    this._flatSuites = this._flatSuites.concat(subFlatSuites);
  }

  _flattenTests() {
    const tests = this._suite.children.filter(item => !item.isSuite);
    const flatSuite = createFlatSuite(tests);
    this._flatSuites.push(flatSuite);
  }

  _filterEmpty() {
    this._flatSuites = this._flatSuites.filter(flatSuite => flatSuite.tests.length > 0);
  }

  _sortBySuiteHooksCount() {
    this._flatSuites.sort((x, y) => y.suiteHooksCount - x.suiteHooksCount);
  }

  _needSingleFlatSuite() {
    if (this._suiteHooksCount > 0) {
      return true;
    } else if (this._isFileSuite()) {
      return config.newSessionPerFile || !config.splitSuites;
    } else {
      return false;
    }
  }

  _mergeAsSingleFlatSuite() {
    if (this._flatSuites.length) {
      const maxSuiteHooksCount = this._flatSuites[0].suiteHooksCount;
      const tests = this._mergeTests();
      const singleFlatSuite = createFlatSuite(tests, this._suiteHooksCount + maxSuiteHooksCount);
      return [singleFlatSuite];
    } else {
      return [];
    }
  }

  _mergeTests() {
    return this._flatSuites.reduce((res, flatSuite) => res.concat(flatSuite.tests), []);
  }

  _isFileSuite() {
    return this._suite.name && !this._suite.parent;
  }
};

function createFlatSuite(tests, suiteHooksCount = 0) {
  return {tests, suiteHooksCount};
}
