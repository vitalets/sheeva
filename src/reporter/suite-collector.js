/**
 * Collects runtime data about suites and emit
 * SUITE_START and final SUITE_END events
 */

const events = require('../events');

module.exports = class SuiteCollector {
  constructor(reporter) {
    this._reporter = reporter;
    this._suites = new Map();
  }
  handleSessionSuiteStart(data) {
    const suite = data.suite;
    let counter = this._suites.get(suite) || 0;
    counter++;
    this._suites.set(suite, counter);
    if (counter === 1) {
      this._reporter.onEvent(events.SUITE_START, data);
    }
  }
  handleSessionSuiteEnd(data) {
    const suite = data.suite;
    let counter = this._suites.get(suite);
    if (typeof counter !== 'number') {
      throw new Error('Got SESSION_SUITE_END before SESSION_SUITE_START');
    }
    counter--;
    if (counter) {
      this._suites.set(suite, counter);
    } else {
      this._suites.delete(suite);
      this._reporter.onEvent(events.SUITE_END, data);
    }
  }
};
