/**
 * Proxy events to collector and reporters.
 */

const events = require('../events');
const SuitesCollector = require('./collectors/suites');
const TimeCollector = require('./collectors/time');
const ErrorsCollector = require('./collectors/errors');
const fs = require('fs');

module.exports = class TopReporter {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} options.reporters
   * @param {Array} options.envs
   * @param {String|Boolean} options.timings
   */
  constructor(options) {
    this._reporters = options.reporters.map(createReporter).filter(Boolean);
    this._timings = options.timings;
    this._envCollectors = new Map();
    options.envs.forEach(env => {
      this._envCollectors.set(env, {
        suites: new SuitesCollector(this),
        time: new TimeCollector(),
        errors: new ErrorsCollector(),
        // envs ?
      });
    });
  }
  get(index) {
    return this._reporters[index];
  }
  handleEvent(event, data) {
    data = addTimestamp(data);
    // todo: maybe use setImmediate/nextTick to do main things first. Check in bench.
    this._proxyEvent(event, data);
    this._collectEvent(event, data);
    if (event === events.RUNNER_END && this._timings) {
      this._saveTimes();
    }
  }
  getResult() {
    const result = {
      errors: [],
    };
    this._envCollectors.forEach(collectors => {
      result.errors = result.errors.concat(collectors.errors.errors);
    });
    return result;
  }
  _proxyEvent(event, data) {
    this._reporters.forEach(reporter => {
      if (typeof reporter.handleEvent === 'function') {
        try {
          reporter.handleEvent(event, data);
        } catch(e) {
          console.log(`Error in reporter ${reporter.constructor.name}`, e);
        }
      }
    });
  }
  _collectEvent(event, data) {
    if (data.env) {
      const collectors = this._envCollectors.get(data.env);
      Object.keys(collectors).forEach(key => collectors[key].handleEvent(event, data));
    }
  }
  _saveTimes() {
    const result = {};
    this._envCollectors.forEach((collectors, env) => {
      result[env.id] = collectors.time.getJson();
    });
    fs.writeFileSync(this._timings, JSON.stringify(result, false, 2));
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
