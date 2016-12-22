/**
 * Flattens suite tree into flat array of tests and makes sorting.
 * The output is suitable for creating Queue instances.
 */

/**
 * Flatten array of suites/tests into sorted flat array of tests
 * Sorting is applied so that tests with more before/after hooks count are moved to the begining,
 * and tests without before/after hooks are moved to the end.
 * This is useful for suite splitting between parallel sessions because splitting for suites with before/after hooks
 * requires that hooks to be executed again.
 *
 * @param {Array<Suite>} suites
 * @returns {Array<{tests, baCount}>}
 */
module.exports = function (suites) {
  return suites.map(flattenSuite)
    .filter(item => item.tests.length > 0)
    .sort(sorter)
    .map(item => item.tests);
};

/**
 * Recursively flatten children of single suite
 *
 * @param {Suite} suite
 * @returns {Object<{tests, baCount}>}
 */
function flattenSuite(suite) {
  let items = suite.children.map(child => {
    const isChildSuite = Boolean(child.children);
    return isChildSuite ? flattenSuite(child) : {tests: [child], baCount: 0};
  });

  items = items
    .filter(item => item.tests.length > 0)
    .sort(sorter);

  const maxBaCount = items.length ? items[0].baCount : 0;

  return {
    tests: items.reduce((res, item) => res.concat(item.tests), []),
    baCount: maxBaCount + (suite.before.length ? 1 : 0) + (suite.after.length ? 1 : 0),
  };
}

function sorter(x, y) {
  return y.baCount - x.baCount;
}
