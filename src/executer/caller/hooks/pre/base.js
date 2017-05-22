/**
 * Base class for `before` and `beforeEach` hooks.
 * Adds suites to stack and breaks on the first error.
 */

const assert = require('assert');
const utils = require('../../../../utils');

module.exports = class Base {
  /**
   * Constructor
   */
  constructor(hookFn, suiteStack) {
    this._hookFn = hookFn;
    this._suiteStack = suiteStack;
  }

  call(test) {
    const newStack = test.parents;
    assert(newStack.length >= this._suiteStack.length, 'New suite stack should be greater than current');
    const suitesDelta = utils.getStackDiff(this._suiteStack, newStack);
    return utils.reduceWithPromises(suitesDelta, suite => this._callForSuite(suite));
  }

  _callForSuite(/* suite */) {
    throw new Error('Should be implemented');
  }

  _callHooks(hooks) {
    return utils.reduceWithPromises(hooks, hook => this._hookFn.call(hook));
  }
};
