/**
 * Collects timing data for session start/end, hooks and tests.
 */

const events = require('../../../events');
const Meter = require('./meter');

module.exports = class Time {
  constructor() {
    this.sessionStart = new Meter();
    this.sessionEnd = new Meter();
    this.hooks = new Map();
    this.tests = new Map();
  }
  handleEvent(event, data) {
    switch (event) {
      case events.SESSION_START: {
        this.sessionStart.handleStartEvent(event, data);
        break;
      }
      case events.SESSION_STARTED: {
        this.sessionStart.handleEndEvent(event, data);
        break;
      }
      case events.SESSION_ENDING: {
        this.sessionEnd.handleStartEvent(event, data);
        break;
      }
      case events.SESSION_END: {
        this.sessionEnd.handleEndEvent(event, data);
        break;
      }
      case events.HOOK_START: {
        this._getMeter('hooks', data.fn).handleStartEvent(event, data);
        break;
      }
      case events.HOOK_END: {
        this._getMeter('hooks', data.fn, false).handleEndEvent(event, data);
        break;
      }
      case events.TEST_START: {
        this._getMeter('tests', data.test).handleStartEvent(event, data);
        break;
      }
      case events.TEST_END: {
        this._getMeter('tests', data.test, false).handleEndEvent(event, data);
        break;
      }
    }
  }
  getJson() {
    const result = {
      sessionStart: this.sessionStart.avgTime,
      sessionEnd: this.sessionEnd.avgTime,
      hooks: {},
      tests: {},
    };
    this.hooks.forEach((meter, fn) => {
      const key = fn.toString().replace(/[ \n]/g, '');
      result.hooks[key] = meter.avgTime;
    });
    this.tests.forEach((meter, test) => {
      const key = test.fn.toString().replace(/[ \n]/g, '');
      result.tests[key] = meter.avgTime;
    });
    return result;
  }
  _getMeter(type, id, create = true) {
    let meter = this[type].get(id);
    if (!meter) {
      if (create) {
        meter = new Meter();
        this[type].set(id, meter);
      } else {
        throw new Error('Got END event before START');
      }
    }
    return meter;
  }
};
