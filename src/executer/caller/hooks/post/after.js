'use strict';

/**
 * Calls `after` hooks for filled suite stack.
 */

const reporter = require('../../../../reporter');
const {SUITE_END} = require('../../../../events');
const Base = require('./base');

module.exports = class After extends Base {
  _callForSuite(suite) {
    this._suiteStack.pop();
    return this._callHooks(suite.after)
      .finally(() => this._emitSuiteEnd(suite))
      .catch(e => this._handleError(e));
  }

  _emitSuiteEnd(suite) {
    const data = {
      suite,
      session: this._hookFn.session,
      target: this._hookFn.session.target,
    };
    reporter.handleEvent(SUITE_END, data);
  }
};
