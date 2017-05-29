'use strict';

/**
 * Calls `beforeEach` hooks for test.
 */

const Base = require('./base');

module.exports = class BeforeEach extends Base {
  _callForSuite(suite) {
    this._suiteStack.push(suite);
    return this._callHooks(suite.beforeEach);
  }
};
