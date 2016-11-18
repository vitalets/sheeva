/**
 * Flattens suite tree into flat aray of tests and makes sorting.
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
  return suites.map(flattenSuite).sort(sorter);
};

function flattenSuite(suite) {
  const items = suite.children.map(child => {
    return child.children
      ? flattenSuite(child)
      : {tests: [child], baCount: 0};
  });

  items.sort(sorter);
  const maxBaCount = items.length ? items[0].baCount : 0;

  return {
    tests: items.reduce((res, item) => res.concat(item.tests), []),
    baCount: maxBaCount + (suite.before.length ? 1 : 0) + (suite.after.length ? 1 : 0),
  };
}

function sorter(x, y) {
  return y.baCount - x.baCount;
}
