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
        break;
      }
    }
  }
  getLog(env) {
    if (!this._logs.has(env)) {
      this._logs.set(env, []);
    }
    return this._logs.get(env);
  }
  _push(env, str) {
    if (env) {
      this.getLog(env).push(str);
    } else {
      this._logs.forEach(log => log.push(str))
    }
  }
};
