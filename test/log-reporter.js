/**
 * Reporter that just put events into log
 */

const events = require('../src/events');

module.exports = class LogReporter {
  constructor() {
    this._logs = new Map();
  }
  onEvent(event, data) {
    const env = data.env;
    //console.log('log-reporter:', new Date(data.timestamp), event)
    //console.log('\nlog-reporter:', new Date(data.timestamp), event, data.test && data.test.name, '\n')
    //console.log('log-reporter:', event, data.error)
    const errMessage = data && data.error ? ` ${data.error.message}` : '';
    const suiteName = data && data.suite && data.suite.parent ? data.suite.name : 'root';
    switch (event) {
      case events.SUITE_START: {
        this._push(env, `${event} ${suiteName}`);
        break;
      }
      case events.SUITE_END: {
        this._push(env, `${event} ${suiteName}${errMessage}`);
        break;
      }
      case events.HOOK_START: {
        // this.log.push(`${event} ${suiteName} ${data.hookType} ${data.index}`);
        break;
      }
      case events.HOOK_END: {
        this._push(env, `${event} ${suiteName} ${data.hookType} ${data.index}${errMessage}`);
        break;
      }
      case events.TEST_START: {
        // this.log.push(`${event} ${data.test.name}`);
        break;
      }
      case events.TEST_END: {
        this._push(env, `${event} ${data.test.name}${errMessage}`);
        //console.log('\nlog-reporter:', new Date(data.timestamp), data.test.name, '\n')
        break;
      }
    }
  }
  getLog(env, filter) {
    return (this._logs.get(env) || []).filter(line => {
        if (filter && filter.length) {
          return filter.some(f => line.startsWith(f))
        } else {
          return true;
        }
    });
  }
  _push(env, str) {
    if (env) {
      if (!this._logs.has(env)) {
        this._logs.set(env, []);
      }
      this._logs.get(env).push(str);
    } else {
      this._logs.forEach(log => log.push(str))
    }
  }
};
