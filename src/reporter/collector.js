/**
 * Collects different runtime data and emits initial/final events.
 * - SUITE_START
 * - SUITE_END
 * - ENV_END
 */

const events = require('../events');
const Counter = require('./counter');

module.exports = class Collector {
  constructor(reporter) {
    this._reporter = reporter;
    this._suiteCounter = new Counter();
    this._sessionCounter = new Counter();
    this._errors = [];
  }
  get errors() {
    return this._errors;
  }
  handleEvent(event, data) {
    switch (event) {
      case events.START: {
        this._reset();
        break;
      }
      case events.SESSION_START: {
        this._handleSessionStart(data);
        break;
      }
      case events.SESSION_END: {
        this._handleSessionEnd(data);
        break;
      }
      case events.SESSION_SUITE_START: {
        this._handleSessionSuiteStart(data);
        break;
      }
      case events.SESSION_SUITE_END: {
        this._handleSessionSuiteEnd(data);
        break;
      }
      case events.SUITE_START: {
        break;
      }
      case events.SUITE_END: {
        break;
      }
    }
  }
  _emit(event, data) {
    this._reporter.onEvent(event, data);
  }
  _reset() {
    this._suiteCounter.reset();
    this._sessionCounter.reset();
    this._errors.length = 0;
  }
  _handleSessionStart({env}) {
    this._sessionCounter.handleStartEvent(env);
  }
  _handleSessionEnd({env}) {
    this._sessionCounter.handleEndEvent(env);
    if (this._sessionCounter.isLast) {
      this._emit(events.ENV_END, {env});
    }
  }
  _handleSessionSuiteStart(data) {
    this._suiteCounter.handleStartEvent(data.suite);
    if (this._suiteCounter.isFirstForId) {
      this._emit(events.SUITE_START, data);
    }
  }
  _handleSessionSuiteEnd(data) {
    this._suiteCounter.handleEndEvent(data.suite);
    if (this._suiteCounter.isLastForId) {
      this._emit(events.SUITE_END, data);
    }
  }
  // todo
  _handleError(data) {
    this._errors.push(data);
  }
};
