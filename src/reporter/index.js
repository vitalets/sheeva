/**
 * Manages reporters and events
 */

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
    this._proxyEvent('onEvent', event, data);
  }
  onSessionEvent(event, data) {
    data = addTimestamp(data);
    this._proxyEvent('onSessionEvent', event, data);
  }
  _proxyEvent(type, event, data) {
    // todo: use process.nextTick to do main things first
    this._reporters.forEach(reporter => {
      if (reporter[type]) {
        // todo: try catch
        reporter[type](event, data);
      }
    })
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
  data.timestamp = Date.now();
  return data;
}
