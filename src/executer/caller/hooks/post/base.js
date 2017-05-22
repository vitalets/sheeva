/**
 * Base class for `after` and `afterEach` hooks.
 * Removes suites from stack, does not break on error but returns first error.
 */

const assert = require('assert');
const reporter = require('../../../../reporter');
const utils = require('../../../../utils');

module.exports = class Base {
  /**
   * Constructor
   *
   * @param {HookFn} hookFn
   * @param {Array} suiteStack
   */
  constructor(hookFn, suiteStack) {
    this._hookFn = hookFn;
    this._suiteStack = suiteStack;
    this._firstError = null;
  }

  call(stopSuite) {
    this._firstError = null;
    const newStack = stopSuite ? stopSuite.parents.concat([stopSuite]) : [];
    assert(newStack.length <= this._suiteStack.length, 'New suite stack should be less than current');
    const suites = utils.getStackDiff(this._suiteStack, newStack);
    const reversedSuites = suites.reverse();
    return utils.reduceWithPromises(reversedSuites, suite => this._callForSuite(suite))
      .finally(() => this._firstError ? Promise.reject(this._firstError) : null);
  }

  _callForSuite(/* suite */) {
    throw new Error('Should be implemented');
  }

  _callHooks(hooks) {
    return utils.reduceWithPromises(hooks, hook => this._hookFn.call(hook))
      .catch(e => this._handleError(e));
  }

  _handleError(error) {
    if (!this._firstError) {
      this._firstError = error;
    }
    reporter.handleError(error);
  }
};
