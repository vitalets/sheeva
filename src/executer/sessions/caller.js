/**
 * Calls hooks and test fn
 */

const {config} = require('../../configurator');
const reporter = require('../../reporter');

const {
  SESSION_SUITE_START,
  SESSION_SUITE_END,
  HOOK_START,
  HOOK_END,
  TEST_START,
  TEST_END,
} = require('../../events');

module.exports = class Caller {
  /**
   * Constructor
   *
   * @param {Session} session
   */
  constructor(session) {
    this._session = session;
    this._beforeEachStack = [];
    this._errorSuite = null;
    this._error = null;
    this._contexts = new Map();
  }

  get errorSuite() {
    return this._errorSuite;
  }

  /**
   * Calls all `before` hooks for test (starting from last suite in suiteStack)
   */
  callBefore(suiteStack, test) {
    const lastSuite = suiteStack[suiteStack.length - 1];
    const lastSuiteIndex = test.parents.findIndex(suite => suite === lastSuite);
    const suites = test.parents.slice(lastSuiteIndex + 1);
    return suites.reduce((res, suite) => {
      return res
        .then(() => {
          suiteStack.push(suite);
          this._emit(SESSION_SUITE_START, {suite});
          return this._callHooksArray(suite, 'before');
        })
        .catch(error => this._storeErrorForSuite(suite, error));
    }, Promise.resolve());
  }

  /**
   * Calls test fn with beforeEach / afterEach hooks
   */
  callTest(suiteStack, test) {
    this._contexts.set(test, {});
    return Promise.resolve()
      .then(() => this._callBeforeEach(suiteStack, test))
      .then(() => {
        this._emit(TEST_START, {test});
        return this._callTestFn(test)
          .then(
            () => this._emit(TEST_END, {test}),
            error => this._emit(TEST_END, {test, error})
          )
      })
      .then(
        () => this._callAfterEach(test),
        error => {
          return this._callAfterEach(test)
            // pass through initial error
            .then(() => Promise.reject(error), () => Promise.reject(error));
        }
      );
  }

  /**
   * Calls all `after` hooks going up from deepest suite to stopSuite in suiteStack
   */
  callAfter(suiteStack, stopSuite) {
    const index = suiteStack.findIndex(suite => suite === stopSuite);
    const suites = suiteStack.splice(index + 1);
    return suites.reverse().reduce((res, suite) => {
      return res
        .then(() => this._callHooksArray(suite, 'after'))
        .then(
          () => this._getErrorForSuite(suite),
          // consider error in before hooks more important, than in after
          // todo: report both before and after errors
          afterError => this._getErrorForSuite(suite) || afterError
        )
        .then(error => this._emit(SESSION_SUITE_END, {suite, error}));
    }, Promise.resolve());
  }

  /**
   * Executes all `beforeEach` hooks for current test
   *
   * @returns {*}
   */
  _callBeforeEach(suiteStack, test) {
    this._beforeEachStack.length = 0;
    return suiteStack.reduce((res, suite) => {
      return res
        .then(() => {
          this._beforeEachStack.push(suite);
          return this._callHooksArray(suite, 'beforeEach', this._contexts.get(test));
        })
        .catch(error => this._storeErrorForSuite(suite, error));
    }, Promise.resolve());
  }

  /**
   * Executes all afterEach from stack
   */
  _callAfterEach(test) {
    return this._beforeEachStack.reverse().reduce((res, suite) => {
      return res
        .then(() => this._callHooksArray(suite, 'afterEach', this._contexts.get(test)))
        .catch(error => this._storeErrorForSuite(suite, error));
    }, Promise.resolve());
  }

  /**
   * Calls array of hooks
   *
   * @param {Suite} suite
   * @param {String} hookType
   * @param {Object} context
   */
  _callHooksArray(suite, hookType, context) {
    const hooks = suite[hookType];
    return hooks.reduce((res, fn, index) => {
      return res
        .then(() => {
          const eventData = {fn, suite, hookType, index};
          const params = {fn, suite, hookType, context, hookIndex: index};
          this._emit(HOOK_START, eventData);
          return this._callFn(params)
            .then(
              () => this._emit(HOOK_END, eventData),
              error => {
                this._emit(HOOK_END, Object.assign({}, eventData, {error}));
                return Promise.reject(error);
              }
            )
        })
    }, Promise.resolve());
  }

  _callTestFn(test) {
    const params = {
      fn: test.fn,
      context: this._contexts.get(test),
      test: test,
      suite: test.parent,
    };
    return this._callFn(params);
  }

  _callFn(params) {
    params.session = this._session;
    params.env = this._session.env;
    return Promise.resolve()
      .then(() => config.callTestHookFn(params));
  }

  /**
   * If there was error in hooks for some suite, return it
   *
   * @param {Suite} suite
   */
  _getErrorForSuite(suite) {
    if (this._errorSuite && this._errorSuite === suite) {
      const error = this._error;
      this._errorSuite = null;
      this._error = null;
      return error;
    }
  }

  /**
   * Store error appeared in suited.
   * Error is used when calling `after` hooks
   *
   * @param {Suite} suite
   * @param {Error} error
   */
  _storeErrorForSuite(suite, error) {
    this._errorSuite = suite;
    this._error = error;
    return Promise.reject(error);
  }

  _emit(event, data) {
    data.session = this._session;
    data.env = this._session.env;
    reporter.handleEvent(event, data);
  }
};
