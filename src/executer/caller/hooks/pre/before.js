'use strict';

/**
 * Calls `before` hooks for test.
 */

const reporter = require('../../../../reporter');
const {SUITE_START} = require('../../../../events');
const Base = require('./base');

module.exports = class Before extends Base {
  _callForSuite(suite) {
    this._suiteStack.push(suite);
    this._emitSuiteStart(suite);
    return this._callHooks(suite.before);
  }

  _emitSuiteStart(suite) {
    const data = {
      suite,
      session: this._hookFn.session,
      target: this._hookFn.session.target,
    };
    reporter.handleEvent(SUITE_START, data);
  }
};
