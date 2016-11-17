/**
 * Manages reporters and events
 */

const events = require('../events');
const Collector = require('./collector');

module.exports = class TopReporter {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} options.reporters
   */
  constructor(options) {
    this._reporters = options.reporters.map(createReporter).filter(Boolean);
  }
  get(index) {
    return this._reporters[index];
  }
  onEvent(event, data) {
    data = addTimestamp(data);
    // todo: maybe use setImmediate/nextTick to do main things first. Check in bench.
    this._handleEvent(event, data);
    this._proxyEvent(event, data);
  }
  _proxyEvent(event, data) {
    this._reporters.forEach(reporter => {
      if (typeof reporter.onEvent === 'function') {
        try {
          reporter.onEvent(event, data);
        } catch(e) {
          console.log(`Error in reporter ${reporter.constructor.name}`, e);
        }
      }
    });
  }
  _handleEvent(event, data) {
    switch (event) {
      case events.START: {
        this._collector = new Collector(this);
        break;
      }
      case events.SESSION_START: {
        this._collector.handleSessionStart(data);
        break;
      }
      case events.SESSION_END: {
        this._collector.handleSessionEnd(data);
        break;
      }
      case events.SESSION_SUITE_START: {
        this._collector.handleSessionSuiteStart(data);
        break;
      }
      case events.SESSION_SUITE_END: {
        this._collector.handleSessionSuiteEnd(data);
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
};

function createReporter(reporter) {
  if (!reporter) {
    return null;
  } else {
    return typeof reporter === 'function'
      ? new reporter()
      : reporter;
  }
}

function addTimestamp(data) {
  data = data || {};
  data.timestamp = data.timestamp || Date.now();
  return data;
}
