/**
 * Calls suite-level hooks (before/after)
 */

const reporter = require('../../../reporter');
const {SESSION_SUITE_START, SESSION_SUITE_END} = require('../../../events');
const BaseHooksCaller = require('./base');

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

  /**
   * Store error occured in middle beforeEach / afterEach hooks to emit it later in after hooks
   *
   * @param {Error} error
   */
  storeEachHooksError(error) {
    this._errors.handleMiddleError(error);
  }

  _onSuiteHooksStart(suite) {
    this._emit(SESSION_SUITE_START, {suite});
  }

  _onSuiteHooksEnd(suite) {
    this._emit(SESSION_SUITE_END, {suite, error: this.firstError});
  }

  _emit(event, data) {
    data.session = this._session;
    data.env = this._session.env;
    reporter.handleEvent(event, data);
  }
};
