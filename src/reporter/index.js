/**
 * Proxy events to collector and reporters.
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
    this._collector = new Collector(this);
  }
  get(index) {
    return this._reporters[index];
  }
  onEvent(event, data) {
    data = addTimestamp(data);
    // todo: maybe use setImmediate/nextTick to do main things first. Check in bench.
    this._proxyEvent(event, data);
    this._collector.handleEvent(event, data);
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
};

function createReporter(reporter) {
  if (reporter) {
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
