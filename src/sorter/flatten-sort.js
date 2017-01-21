/**
 *
 * @param {Array<Suite|Test>} items
 * @returns {Array<FlatSuite>}
 */
const flattenSort = module.exports = function (items) {
  return []
    .concat(flattenSuites(items))
    .concat(flattenTests(items))
    .filter(filterEmpty)
    .sort(sortByBaCount);
};

/**
 *
 * @param {Array<Suite|Test>} items
 * @returns {Array<FlatSuite>}
 */
function flattenSuites(items) {
  return items
    .filter(item => isSuite(item))
    .reduce((res, item) => res.concat(flattenSuite(item)), []);
}

/**
 *
 * @param {Array<Suite|Test>} items
 * @returns {Array<FlatSuite>}
 */
function flattenTests(items) {
  const tests = items.filter(item => !isSuite(item));
  return [createFlatSuite(tests)];
}

/**
 * Flattens suite children.
 * If suite has before/after hooks, this fn returns array with single flatSuite element
 * If suite does not have before/after hooks, this fn returns array flatSuites corresponding to children suites
 *
 * @param {Suite} suite
 * @returns {Array<FlatSuite>}
 */
function flattenSuite(suite) {
  const parentBaCount = getBaCount(suite);
  const flatSuites = flattenSort(suite.children);
  if (parentBaCount > 0 && flatSuites.length > 0) {
    return mergeChildrenFlatSuites(flatSuites, parentBaCount);
  } else {
    return flatSuites;
  }
}

function mergeChildrenFlatSuites(flatSuites, parentBaCount) {
  const maxChildrenBaCount = flatSuites[0].baCount;
  const tests = flatSuites.reduce((res, flatSuite) => res.concat(flatSuite.tests), []);
  const result = createFlatSuite(tests, maxChildrenBaCount + parentBaCount);
  return [result];
}

function createFlatSuite(tests, baCount = 0) {
  return {tests, baCount};
}

function isSuite(item) {
  return Boolean(item.children);
}

function getBaCount(suite) {
  return (suite.before.length ? 1 : 0) + (suite.after.length ? 1 : 0);
}

function filterEmpty(flattenSuite) {
  return flattenSuite.tests.length > 0;
}

function sortByBaCount(x, y) {
  return y.baCount - x.baCount;
}
