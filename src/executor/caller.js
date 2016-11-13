/**
 * Calls hooks and test fn
 */

const {
  SESSION_SUITE_START,
  SESSION_SUITE_END,
  HOOK_START,
  HOOK_END,
  TEST_START,
  TEST_END,
} = require('../events');

module.exports = class Caller {
  constructor(session) {
    this._session = session;
    this._beforeEachStack = [];
    this._errorSuite = null;
    this._error = null;
  }

  get errorSuite() {
    return this._errorSuite;
  }

  /**
   * Executes all `before` hooks for test (starting from last suite in suiteStack)
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

    //
    // for (let i = lastSuiteIndex + 1; i < this.currentTest.parents.length; i++) {
    //   const suite = this.currentTest.parents[i];
    //   this.suiteStack.push(suite);
    //   this.emit(events.SESSION_SUITE_START, {suite});
    //   const error = this.executeHooksArray(suite, 'before');
    //   if (error) {
    //     this.errorSuite = suite;
    //     this.error = error;
    //     break;
    //   }
    // }
  }

  /**
   * Calls test fn with beforeEach / afterEach hooks
   */
  callTest(suiteStack, test) {
    test.createContext();
    return Promise.resolve()
      .then(() => this._callBeforeEach(suiteStack, test))
      .then(() => {
        this._emit(TEST_START, {test});
        const {fn, context} = test;
        return this._callFn({fn, context, test, suite: test.parent})
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

    // if (!this.errorSuite) {
    //   this.emit(events.TEST_START, {test});
    //   try {
    //     const {fn, context} = test;
    //     this.executeFn({fn, context, test});
    //     this.emit(events.TEST_END, {test});
    //   } catch (error) {
    //     this.emit(events.TEST_END, {test, error});
    //   }
    // }
    // this.executeAfterEach();
  }

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
          return this._callHooksArray(suite, 'beforeEach', test.context);
        })
        .catch(error => this._storeErrorForSuite(suite, error));
    }, Promise.resolve());

    //
    // for (let i = 0; i < this.suiteStack.length; i++) {
    //   const suite = this.suiteStack[i];
    //   this.beforeEachStack.push(suite);
    //   const error = this.executeHooksArray(suite, 'beforeEach', this.currentTest.context);
    //   if (error) {
    //     this.errorSuite = suite;
    //     this.error = error;
    //     break;
    //   }
    // }
  }

  /**
   * Executes all afterEach from stack
   */
  _callAfterEach(test) {
    return this._beforeEachStack.reverse().reduce((res, suite) => {
      return res
        .then(() => this._callHooksArray(suite, 'afterEach', test.context))
        .catch(error => this._storeErrorForSuite(suite, error));
    }, Promise.resolve());

    // for (let i = this.beforeEachStack.length - 1; i >= 0; i--) {
    //   const suite = this.beforeEachStack[i];
    //   const error = this.executeHooksArray(suite, 'afterEach');
    //   if (error) {
    //     this.errorSuite = suite;
    //     this.error = error;
    //   }
    // }
  }

  _callHooksArray(suite, hookType, context) {
    const hooks = suite[hookType];
    return hooks.reduce((res, fn, index) => {
      return res
        .then(() => {
          const eventData = {suite, hookType, index};
          this._emit(HOOK_START, eventData);
          return this._callFn({fn, suite, hookType, context, hookIndex: index})
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

  _callFn(params) {
    const wrapFn = this._session.createWrapFn(params);
    return Promise.resolve().then(() => wrapFn())
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

  _emit(event, data = {}) {
    this._session.emit(event, data);
  }
};
