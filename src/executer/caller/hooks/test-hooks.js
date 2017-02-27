/**
 * Calls test-level hooks (beforeEach/afterEach)
 */

const BaseHooksCaller = require('./base-hooks');

module.exports = class EachHooksCaller extends BaseHooksCaller {
  /**
   * Calls all beforeEach hooks for test starting from top suite.
   * If error occurs in hook, stops going down and rejects with error.
   *
   * @param {Test} test
   * @returns {Promise}
   */
  callBeforeEach(test) {
    const newSuiteStack = test.parents;
    return this._callPreHooks('beforeEach', newSuiteStack);
  }

  /**
   * Calls all afterEach hooks going up by current suiteStack.
   * If error occurs in hook, anyway goes up and rejects with error.
   *
   * @returns {Promise}
   */
  callAfterEach() {
    const newSuiteStack = [];
    return this._callPostHooks('afterEach', newSuiteStack);
  }
};
