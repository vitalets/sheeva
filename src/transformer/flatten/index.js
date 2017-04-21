/**
 * Flatten and sort suites tree before execution.
 * Sorting is applied so that tests with more before/after hooks count are moved to the beginning,
 * and tests without before/after hooks are moved to the end.
 * This is useful for suite splitting between parallel sessions because splitting for suites with before/after hooks
 * requires these hooks to be executed again.
 *
 */

const {result} = require('../../result');
const SuiteFlattener = require('./suite-flattener');

module.exports = function () {
  const {topSuitesPerEnv, flatSuitesPerEnv} = result;
  topSuitesPerEnv.forEach((topSuites, env) => {
    const flatSuites = new SuiteFlattener({children: topSuites.toArray()}).flatten();
    flatSuitesPerEnv.set(env, flatSuites);
  });
};
