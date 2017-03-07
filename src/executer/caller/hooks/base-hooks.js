/**
 * Base class for calling hooks in suite stack
 */

const utils = require('../../../utils');
const HookCaller = require('./hook');

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
    this._errors = [];
  }

  /**
   * Returns first error
   *
   * @returns {Error|null}
   */
  get error() {
    return this._errors[0];
  }

  _callPreHooks(hookType, newSuiteStack) {
    const suites = utils.getStackDiff(this._suiteStack, newSuiteStack);
    return utils.reduceWithPromises(suites, suite => this._callSuitePreHooks(suite, hookType));
  }

  _callPostHooks(hookType, newSuiteStack) {
    utils.assertOk(newSuiteStack.length <= this._suiteStack.length, 'New suite stack should be less than current');
    const suites = utils.getStackDiff(this._suiteStack, newSuiteStack);
    const reversedSuites = suites.reverse();
    return utils.reduceWithPromises(reversedSuites, suite => this._callSuitePostHooks(suite, hookType));
  }

  _callSuitePreHooks(suite, hookType) {
    const hooks = suite[hookType];
    this._suiteStack.push(suite);
    this._onSuiteHooksStart(suite);
    return this._callHooks(hooks)
      .catch(e => this._addErrorAndReject(e));
  }

  _callSuitePostHooks(suite, hookType) {
    const hooks = suite[hookType];
    const popedSuite = this._suiteStack.pop();
    utils.assertOk(popedSuite === suite, `Something wrong with suite stack`);
    return this._callHooks(hooks)
      .catch(e => this._addError(e))
      .finally(() => this._onSuiteHooksEnd(suite));
  }

  _callHooks(hooks) {
    return utils.reduceWithPromises(hooks, hook => this._callHook(hook));
  }

  _callHook(hook) {
    return new HookCaller(this._session, this._context, hook).call();
  }

  _addErrorAndReject(error) {
    this._addError(error);
    return Promise.reject(error);
  }

  _addError(error) {
    this._errors.push(error);
  }

  _onSuiteHooksStart() { }

  _onSuiteHooksEnd() { }
};
