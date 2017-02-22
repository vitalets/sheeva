/**
 * Classes for calling hooks and test
 */

/**
 * Calls suite level hooks (before / after).
 * Used in Queue.
 */
exports.SuiteHooksCaller = require('./hooks').SuiteHooksCaller;

/**
 * Calls test fn with level hooks (beforeEach / afterEach).
 * Used in Queue.
 */
exports.TestCaller = require('./test');
