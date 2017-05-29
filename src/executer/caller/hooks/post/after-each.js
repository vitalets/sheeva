'use strict';

/**
 * Calls `afterEach` hooks for filled suite stack.
 */

const Base = require('./base');

module.exports = class AfterEach extends Base {
  _callForSuite(suite) {
    this._suiteStack.pop();
    return this._callHooks(suite.afterEach);
  }
};
