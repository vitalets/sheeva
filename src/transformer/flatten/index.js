'use strict';

/**
 * Flatten and sort suites tree before execution.
 * Sorting is applied so that tests with more before/after hooks count are moved to the beginning,
 * and tests without before/after hooks are moved to the end.
 * This is useful for suite splitting between parallel sessions because splitting for suites with before/after hooks
 * requires these hooks to be executed again.
 */

const state = require('../../state');
const SuiteFlattener = require('./suite-flattener');

module.exports = function () {
  const {topSuitesPerTarget, flatSuitesPerTarget} = state;
  topSuitesPerTarget.forEach((topSuites, target) => {
    const suiteFlattener = new SuiteFlattener({children: topSuites.toArray()});
    const flatSuites = suiteFlattener.flatten().map(attachIndex);
    flatSuitesPerTarget.set(target, flatSuites);
  });
};

function attachIndex(flatSuite, index) {
  flatSuite.index = index;
  return flatSuite;
}
