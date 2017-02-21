/**
 * Base class for calling hooks in suite stack
 */

const utils = require('../../../utils');
const HookCaller = require('./hook');
const Errors = require('./errors');

module.exports = class BaseHooksCaller {
  /**
   * Constructor
   *
   * @param {Session} session
   * @param {Object} context
   * @param {Array} [suiteStack]
   */
  constructor(session, context, suiteStack = []) {
    this._session = session;
    this._context = context;
    this._suiteStack = suiteStack;
    this._errors = new Errors();
  }

  /**
   * Returns first error
   *
   * @returns {Error|null}
   */
  get firstError() {
    return this._errors.firstError;
  }

  _callPreHooks(hookType, newSuiteStack) {
    const suites = utils.getStackDiff(this._suiteStack, newSuiteStack);
    return utils.reduceWithPromises(suites, suite => this._callSuitePreHooks(suite, hookType));
  }

  _callPostHooks(hookType, newSuiteStack) {
    const suites = utils.getStackDiff(this._suiteStack, newSuiteStack);
    const reversedSuites = suites.reverse();
    return utils.reduceWithPromises(reversedSuites, suite => this._callSuitePostHooks(suite, hookType));
  }

  _callSuitePreHooks(suite, hookType) {
    const hooks = suite[hookType];
    this._suiteStack.push(suite);
    this._onSuiteHooksStart(suite);
    return this._callHooks(hooks)
      .catch(error => this._errors.handlePreHookError(suite, error))
  }

  _callSuitePostHooks(suite, hookType) {
    const hooks = suite[hookType];
    const popedSuite = this._suiteStack.pop();
    if (popedSuite !== suite) {
      throw new Error('Something goes wrong');
    }
    return this._callHooks(hooks)
      .catch(error => this._errors.handlePostHookError(suite, error))
      .finally(() => this._onSuiteHooksEnd(suite));
  }

  _callHooks(hooks) {
    return utils.reduceWithPromises(hooks, hook => {
      return new HookCaller(this._session, this._context, hook).call();
    });
  }

  _onSuiteHooksStart() { }

  _onSuiteHooksEnd() { }
};
