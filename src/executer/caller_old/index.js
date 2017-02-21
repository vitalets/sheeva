/**
 * Calls hooks and test fn
 */

const {config} = require('../../configurator');
const reporter = require('../../reporter');
const Errors = require('./errors');

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
    //this._beforeEachStack = [];
    // this._errorSuite = null;
    this._errors = new Errors();
  }

  get errorSuite() {
    return this._errorSuite;
  }

  /**
   * Calls all `before` hooks for test (starting from last suite in suiteStack)
   *
   * todo:
   * Context in before/after hooks is not supported as it is not clear how to store contexts
   * for different levels of suite tree.
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
          return this._callSuiteHooks(suite, 'before');
        })
        .catch(error => this._errors.storeAndReject(suite, error));
    }, Promise.resolve());
  }

  /**
   * Calls all `after` hooks going up from deepest suite to stopSuite in suiteStack
   */
  callAfter(suiteStack, stopSuite) {
    const index = suiteStack.findIndex(suite => suite === stopSuite);
    const suites = suiteStack.splice(index + 1);
    return suites.reverse().reduce((res, suite) => {
      return res
        .then(() => this._callSuiteHooks(suite, 'after'))
        .catch(error => this._errors.store(suite, error))
        .finally(() => {
          const error = this._errors.get(suite);
          this._emit(SESSION_SUITE_END, {suite, error});
        });
    }, Promise.resolve());
  }

  /**
   * Calls test fn with beforeEach / afterEach hooks
   */
  callTestWithEachHooks(suiteStack, test) {
    const context = {};
    return Promise.resolve()
      .then(() => this._callBeforeEach(suiteStack, context))
      .then(() => this._callTest(test, context))
      .finally(() => this._callAfterEach(context))
  }

  /**
   * Calls test fn with beforeEach / afterEach hooks
   */
  _callTest(test, context) {
    const eventData = {test};
    this._emit(TEST_START, eventData);
    return this._callTestFn(test, context)
      .catch(error => eventData.error = error)
      .finally(() => this._emit(TEST_END, eventData))
  }

  /**
   * Executes all `beforeEach` hooks from stack
   *
   * @returns {*}
   */
  // _callBeforeEach(suiteStack, context) {
  //   this._beforeEachStack.length = 0;
  //   return suiteStack.reduce((res, suite) => {
  //     return res
  //       .then(() => {
  //         this._beforeEachStack.push(suite);
  //         return this._callSuiteHooks(suite, 'beforeEach', context);
  //       })
  //       .catch(error => this._errors.storeAndReject(suite, error));
  //   }, Promise.resolve());
  // }

  /**
   * Executes all `afterEach` hooks from beforeEachStack
   */
  // _callAfterEach(context) {
  //   return this._beforeEachStack.reverse().reduce((res, suite) => {
  //     return res
  //       .then(() => this._callSuiteHooks(suite, 'afterEach', context))
  //       .catch(error => this._errors.store(suite, error));
  //   }, Promise.resolve());
  // }

  /**
   * Calls all hooks of specified type in suite
   *
   * @param {Suite} suite
   * @param {String} hookType
   * @param {Object} context
   */
  _callSuiteHooks(suite, hookType, context) {
    const hooks = suite[hookType];
    return hooks.reduce((res, fn, index) => {
      return res
        .then(() => {
          const eventData = {fn, suite, hookType, index};
          const params = {fn, suite, hookType, context, hookIndex: index};
          this._emit(HOOK_START, eventData);
          return this._callFn(params)
            .catch(error => {
              eventData.error = error;
              return Promise.reject(error);
            })
            .finally(() => this._emit(HOOK_END, eventData));
        })
    }, Promise.resolve());
  }

  _callTestFn(test, context) {
    const params = {
      test,
      context,
      suite: test.parent,
      fn: test.fn,
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
  // _getErrorForSuite(suite) {
  //   if (this._errorSuite && this._errorSuite === suite) {
  //     const error = this._error;
  //     this._errorSuite = null;
  //     this._error = null;
  //     return error;
  //   }
  // }

  /**
   * Store error appeared in suited.
   * Error is used when calling `after` hooks
   *
   * @param {Suite} suite
   * @param {Error} error
   */
  // _storeErrorAndReject(suite, error) {
  //   this._errorSuite = suite;
  //   this._error = error;
  //   return Promise.reject(error);
  // }

  _emit(event, data) {
    data.session = this._session;
    data.env = this._session.env;
    reporter.handleEvent(event, data);
  }
};
