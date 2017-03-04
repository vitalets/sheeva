/**
 * Classes for calling suite-level hooks (before/after) and test-level hooks (beforeEach/afterEach)
 */

/**
 * Calls suite level hooks (before / after).
 * Used in Queue.
 */
exports.SuiteHooksCaller = require('./suite-hooks');

/**
 * Calls test level hooks (beforeEach / afterEach).
 * Used in TestCaller.
 */
exports.TestHooksCaller = require('./test-hooks');
