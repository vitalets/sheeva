/**
 * Collects session suite events and emits final SUITE_START / SUITE_END
 * As suite can be executed on several concurrent sessions,
 */

const events = require('../../events');

module.exports = class SuitesCollector {
  constructor(reporter) {
    this._reporter = reporter;
    this._suites = new Map();
  }

  handleEvent(event, data) {
    switch (event) {
      case events.QUEUE_SPLIT: {
        // todo: temporary just proxy
        //this._emit(events.QUEUE_SPLIT, data);
        //this._handleSessionSuiteStart(data);
        break;
      }
      case events.SESSION_SUITE_START: {
        this._emit(events.SUITE_START, data);
        //this._handleSessionSuiteStart(data);
        break;
      }
      case events.SESSION_SUITE_END: {
        // todo: temporary just proxy
        this._emit(events.SUITE_END, data);
        //this._handleSessionSuiteEnd(data);
        break;
      }
    }
  }

  _emit(event, data) {
    this._reporter.handleEvent(event, data);
  }

  _getSuiteState(suite) {
    let suiteState = this._state.get(suite);
    if (!suiteState) {
      suiteState = {
        started: false,
        ends: 0,
        splits: 0,
      };
      this._state.set(suite, suiteState);
    }
    return suiteState;
  }
  // _handleSessionSuiteStart(data) {
  //   this._suiteCounter.handleStartEvent(data.suite);
  //   if (this._suiteCounter.isFirstForId) {
  //     this._emit(events.SUITE_START, data);
  //   }
  // }
  // _handleSessionSuiteEnd(data) {
  //   this._suiteCounter.handleEndEvent(data.suite);
  //   if (this._suiteCounter.isLastForId) {
  //     this._emit(events.SUITE_END, data);
  //   }
  // }
};
