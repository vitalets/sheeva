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
    this._reporters = reporters.map(createReporter).filter(Boolean);
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

function createReporter(Reporter) {
  if (!Reporter) {
    return null;
  }

  if (typeof Reporter === 'string') {
    if (builtInReporters.hasOwnProperty(Reporter)) {
      Reporter = builtInReporters[Reporter];
    } else {
      // todo: require
      throw new Error(`Reporter not found: ${Reporter}`)
    }
  }

  if (typeof Reporter === 'function') {
    return new Reporter();
  } else {
    throw new Error(`Reporter should be a class or constructor, got ${typeof Reporter}`);
  }
}

function addTimestamp(data) {
  data = data || {};
  data.timestamp = data.timestamp || Date.now();
  return data;
}
