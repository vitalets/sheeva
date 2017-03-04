/**
 * Converts suite to one or several flatSuites.
 * Recursively flattens suite children.
 *
 * 1. If suite has before/after hooks, flatten() returns array with single flatSuite element
 * 2. If suite does not have before/after hooks, flatten() returns array with several flatSuites corresponding
 *    to children suites. When it occurs for file suite it is basically splitting because each sub-suite can be sorted
 *    individually to beginning or end of env suites (depending on it's before/after count).
 *
 * @typedef {Object} FlatSuite
 * @property {Array<Test>} tests
 * @property {Number} suiteHooksCount max number of suite-level hooks (before / after)
 */

const {config} = require('../../configurator');

module.exports = class SuiteFlattener {
  /**
   * Constructor
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
    return this._needSingleFlatSuite() ? this._wrapAsSingleFlatSuite() : this._flatSuites;
  }

  _calcSuiteHooksCount() {
    const {before, after} = this._suite;
    const beforeHooksCount = before && before.length ? 1 : 0;
    const afterHooksCount = after && after.length ? 1 : 0;
    this._suiteHooksCount = beforeHooksCount + afterHooksCount;
  }

  _flattenSubSuites() {
    this._suite.children
      .filter(item => item.isSuite)
      .map(suite => this._flattenSubSuite(suite));
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

  _wrapAsSingleFlatSuite() {
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

  _needSingleFlatSuite() {
    if (this._suiteHooksCount > 0) {
      return true;
    } else if (this._isFileSuite()) {
      return config.newSessionPerFile || !config.splitSuites;
    } else {
      return false;
    }
  }

  _isFileSuite() {
    return this._suite.name && !this._suite.parent;
  }
};

function createFlatSuite(tests, suiteHooksCount = 0) {
  return {tests, suiteHooksCount};
}
