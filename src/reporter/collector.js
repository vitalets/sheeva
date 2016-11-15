/**
 * Collects runtime data and emits iitial/final events.
 * - SUITE_START
 * - SUITE_END
 * - ENV_END
 */

const events = require('../events');
const Counter = require('../utils/counter');

module.exports = class SuiteCollector {
  constructor(reporter) {
    this._reporter = reporter;
    this._suiteCounter = new Counter();
    this._sessionCounter = new Counter();
    this._errors = [];
  }
  get errors() {
    return this._errors;
  }
  handleSessionStart({env}) {
    this._sessionCounter.handleStartEvent(env);
  }
  handleSessionEnd({env}) {
    this._sessionCounter.handleEndEvent(env);
    if (this._sessionCounter.isLast) {
      this._reporter.onEvent(events.ENV_END, {env});
    }
  }
  handleSessionSuiteStart(data) {
    this._suiteCounter.handleStartEvent(data.suite);
    if (this._suiteCounter.isFirstForId) {
      this._reporter.onEvent(events.SUITE_START, data);
    }
  }
  handleSessionSuiteEnd(data) {
    this._suiteCounter.handleEndEvent(data.suite);
    if (this._suiteCounter.isLastForId) {
      this._reporter.onEvent(events.SUITE_END, data);
    }
  }
  handleError(data) {
    this.errors.push(data);
  }
};
