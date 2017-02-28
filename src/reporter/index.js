/**
 * Process all events and proxy to other reporters.
 */

const {config} = require('../configurator');
// const TimeCollector = require('./collectors/time');
const ErrorsCollector = require('./collectors/errors');

class Reporter {
  /**
   * Constructor
   */
  constructor() {
    this._reporters = [];
    this._collectors = new Map();
    this._currentEvent = null;
    this._currentData = null;
    this._listen = true;
  }

  init() {
    this._initReporters();
    this._initCollectors();
  }

  get(index) {
    return this._reporters[index];
  }

  handleEvent(event, data = {}) {
    if (this._listen) {
      this._currentEvent = event;
      this._currentData = Object.assign({}, data);
      this._addTimestamp();
      this._proxyToReporters();
      this._proxyToCollectors();
    }
  }

  getResult() {
    const result = {
      errors: [],
    };
    this._collectors.forEach(envCollectors => {
      result.errors = result.errors.concat(envCollectors.errors.errors);
    });
    return result;
  }

  stopListen() {
    this._listen = false;
  }

  _initReporters() {
    this._reporters = config.reporters
      .filter(Boolean)
      .map(customReporter => typeof customReporter === 'function' ? new customReporter() : customReporter)
      .map(customReporter => {
        if (typeof customReporter.handleEvent !== 'function') {
          throw new Error('Each reporter should have `handleEvent()` method');
        }
        return customReporter;
      })
  }

  _initCollectors() {
    this._collectors.clear();
    config.envs.forEach(env => {
      this._collectors.set(env, {
        //time: new TimeCollector(),
        errors: new ErrorsCollector(),
      });
    });
  }

  _addTimestamp() {
    this._currentData.timestamp = Date.now();
  }

  _proxyToReporters() {
    this._reporters.forEach(customReporter => {
      //try {
        customReporter.handleEvent(this._currentEvent, this._currentData);
      // } catch (e) {
      //   console.log('_proxyToReporters', e)
      // }
    });
  }

  _proxyToCollectors() {
    if (this._currentData.env) {
      const envCollectors = this._collectors.get(this._currentData.env);
      Object.keys(envCollectors).forEach(key => {
        envCollectors[key].handleEvent(this._currentEvent, this._currentData);
      });
    }
  }
}

module.exports = new Reporter();
