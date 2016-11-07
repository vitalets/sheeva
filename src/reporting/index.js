/**
 * Manages reporters and events
 */

const builtIn = {
  console: require('./console'),
  json: require('./json'),
};

module.exports = class Reporting {
  constructor(reportersConfig) {
    reportersConfig = reportersConfig
      ? (Array.isArray(reportersConfig) ? reportersConfig : [reportersConfig])
      : ['console'];
    this._reporters = reportersConfig.map(createReporter);
  }
  getReporter(index) {
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
    if (builtIn.hasOwnProperty(Reporter)) {
      Reporter = builtIn[Reporter];
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
