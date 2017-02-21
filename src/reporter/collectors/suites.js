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
        // data.suites.forEach(suite => this._handleSuiteSplit(suite));
        break;
      }
      case events.SESSION_SUITE_START: {
        this._reporter.handleEvent(events.SUITE_START, data);
        //this._handleSessionSuiteStart(data);
        break;
      }
      case events.SESSION_SUITE_END: {
        this._reporter.handleEvent(events.SUITE_END, data);
        //this._handleSessionSuiteEnd(data);
        break;
      }
    }
  }

  _handleSessionSuiteStart(data) {
    const suiteState = this._getSuiteState(data.suite);
    if (!suiteState.started) {
      suiteState.started = true;
      this._emit(events.SUITE_START, data);
    }
  }

  _handleSuiteSplit(suite) {
    const suiteState = this._getSuiteState(suite);
    suiteState.splits++;
  }

  _handleSessionSuiteEnd(data) {
    const suiteState = this._getSuiteState(data.suite);
    if (!suiteState.started) {
      throw new Error(`Got SESSION_SUITE_END before suite start`);
    }
    suiteState.ends++;
    if (suiteState.ends === suiteState.splits + 1) {
      this._emit(events.SUITE_END, data);
    }
  }

  _getSuiteState(suite) {
    let suiteState = this._suites.get(suite);
    if (!suiteState) {
      suiteState = {
        started: false,
        ends: 0,
        splits: 0,
      };
      this._suites.set(suite, suiteState);
    }
    return suiteState;
  }

  _emit(event, data) {
    const newData = {
      suite: data.suite,
      env: data.env,
    };
    this._reporter.handleEvent(event, newData);
  }
};
