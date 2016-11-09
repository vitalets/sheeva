/**
 * Manages reporters and events
 */

const events = require('../events');
const Collector = require('./collector');

const builtInReporters = {
  console: require('./console'),
  json: require('./json'),
};

module.exports = class TopReporter {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} options.reporters
   */
  constructor(options) {
    const reporters = Array.isArray(options.reporters) ? options.reporters : [options.reporters];
    this._reporters = reporters.map(createReporter);
  }
  get(index) {
    return this._reporters[index];
  }
  onEvent(event, data) {
    data = addTimestamp(data);
    // todo: use process.nextTick to do main things first
    this._handleEvent(event, data);
    this._proxyEvent(event, data);
  }
  _proxyEvent(event, data) {
    this._reporters.forEach(reporter => {
      if (reporter.onEvent) {
        // todo: try catch
        reporter.onEvent(event, data);
      }
    });
  }
  _handleEvent(event, data) {
    switch (event) {
      case events.START: {
        this._collector = new Collector(this, data.envSuites);
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
    }
  }
};

function createReporter(Reporter) {
  if (typeof Reporter === 'string') {
    if (builtInReporters.hasOwnProperty(Reporter)) {
      Reporter = builtInReporters[Reporter];
    } else {
      // todo: require
      throw new Error(`Reporter not found: ${Reporter}`)
    }
  }
  return new Reporter();
}

function addTimestamp(data) {
  data = data || {};
  data.timestamp = data.timestamp || Date.now();
  return data;
}
