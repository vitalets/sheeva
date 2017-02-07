/**
 * Converts suite to one or several flatSuites.
 * Recursively flattens suite children.
 * If suite has before/after hooks, flatten() returns array with single flatSuite element
 * If suite does not have before/after hooks, flatten() returns array flatSuites corresponding to children suites
 *
 * @typedef {Object} FlatSuite
 * @property {Array<Test>} tests
 * @property {Number} baCount max number of before / after hooks
 */

module.exports = class SuiteFlattener {
  /**
   * Constructor
   */
  constructor(suite) {
    this._suite = suite;
    this._baCount = 0;
    this._flatSuites = [];
  }

  flatten() {
    this._calcBaCount();
    this._flattenSubSuites();
    this._flattenTests();
    this._filterEmpty();
    this._sortByBaCount();
    return this._baCount > 0
      ? this._wrapAsSingleFlatSuite()
      : this._flatSuites;
  }

  _calcBaCount() {
    const {before, after} = this._suite;
    const beforeHooksCount = before && before.length ? 1 : 0;
    const afterHooksCount = after && after.length ? 1 : 0;
    this._baCount = beforeHooksCount + afterHooksCount;
  }

  _flattenSubSuites() {
    this._suite.children
      .filter(item => isSuite(item))
      .map(suite => this._flattenSubSuite(suite))
  }

  _flattenSubSuite(suite) {
    const subFlatSuites = new SuiteFlattener(suite).flatten();
    this._flatSuites = this._flatSuites.concat(subFlatSuites);
  }

  _flattenTests() {
    const tests = this._suite.children.filter(item => !isSuite(item));
    const flatSuite = createFlatSuite(tests);
    this._flatSuites.push(flatSuite);
  }

  _filterEmpty() {
    this._flatSuites = this._flatSuites.filter(flatSuite => flatSuite.tests.length > 0);
  }

  _sortByBaCount() {
    this._flatSuites.sort((x, y) => y.baCount - x.baCount);
  }

  _wrapAsSingleFlatSuite() {
    if (this._flatSuites.length) {
      const maxBaCount = this._flatSuites[0].baCount;
      const tests = this._mergeTests();
      const singleFlatSuite = createFlatSuite(tests, this._baCount + maxBaCount);
      return [singleFlatSuite];
    } else {
      return [];
    }
  }

  _mergeTests() {
    return this._flatSuites.reduce((res, flatSuite) => res.concat(flatSuite.tests), []);
  }
};

function createFlatSuite(tests, baCount = 0) {
  return {tests, baCount};
}

function isSuite(item) {
  return Boolean(item.children);
}
