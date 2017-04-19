/**
 * Process all events and proxy to other reporters.
 */

const {config} = require('../config');
const {result} = require('../result');
const ErrorsCollector = require('./collectors/errors');
const TestsCollector = require('./collectors/tests');
const SessionsCollector = require('./collectors/sessions');
const RunnerTimesCollector = require('./collectors/runner-times');

class Reporter {
  /**
   * Constructor
   */
  constructor() {
    this._reporters = [];
    this._collectors = [];
    this._currentEvent = null;
    this._currentData = null;
    this._listen = true;
  }

  init() {
    this._initCollectors();
    this._initReporters();
  }

  get(index) {
    return this._reporters[index];
  }

  handleEvent(event, data = {}) {
    if (this._listen) {
      this._currentEvent = event;
      this._currentData = Object.assign({}, data);
      this._addTimestamp();
      this._addResult();
      this._proxyToCollectors();
      this._proxyToReporters();
    }
  }

  stopListen() {
    this._listen = false;
  }

  _initCollectors() {
    this._collectors = [
      new ErrorsCollector(),
      new TestsCollector(),
      new SessionsCollector(),
      new RunnerTimesCollector(),
    ];
  }

  _initReporters() {
    this._reporters = config.reporters
      .filter(Boolean)
      .map(reporter => typeof reporter === 'function' ? new reporter() : reporter)
      .map(reporter => {
        if (typeof reporter.handleEvent !== 'function') {
          throw new Error('Each reporter should have `handleEvent()` method');
        }
        return reporter;
      });
  }

  _addTimestamp() {
    this._currentData.timestamp = Date.now();
  }

  _addResult() {
    this._currentData.result = result;
  }

  _proxyToReporters() {
    this._reporters.forEach(reporter => {
      //try {
      reporter.handleEvent(this._currentEvent, this._currentData);
      // } catch (e) {
      //   console.log('_proxyToReporters', e)
      // }
    });
  }

  _proxyToCollectors() {
    this._collectors.forEach(collector => {
      collector.handleEvent(this._currentEvent, this._currentData);
    });
  }
}

module.exports = new Reporter();
