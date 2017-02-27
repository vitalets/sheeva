/**
 * Calls suite-level hooks (before/after)
 */

const reporter = require('../../../reporter');
const {SUITE_START, SUITE_END} = require('../../../events');
const BaseHooksCaller = require('./base-hooks');

module.exports = class SuiteHooksCaller extends BaseHooksCaller {
  /**
   * Calls before hooks for test starting from current suite in suiteStack.
   * If error occurs in hook, stops going down and rejects with error.
   *
   * @param {Test} test
   * @returns {Promise}
   */
  callBefore(test) {
    const newSuiteStack = test.parents;
    return this._callPreHooks('before', newSuiteStack);
  }

  /**
   * Calls after hooks going up to specified stopSuite from current suite in suiteStack.
   * If error occurs in hook, anyway goes up and rejects with error.
   *
   * @param {Suite} stopSuite
   * @returns {Promise}
   */
  callAfter(stopSuite) {
    const newSuiteStack = stopSuite ? stopSuite.parents.concat([stopSuite]) : [];
    return this._callPostHooks('after', newSuiteStack);
  }

  _onSuiteHooksStart(suite) {
    this._emit(SUITE_START, {suite});
  }

  _onSuiteHooksEnd(suite) {
    this._emit(SUITE_END, {suite, error: this.error});
  }

  _emit(event, data) {
    data.session = this._session;
    data.env = this._session.env;
    reporter.handleEvent(event, data);
  }
};
