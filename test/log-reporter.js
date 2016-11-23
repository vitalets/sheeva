/**
 * Reporter that just put events into log
 */

const events = require('../src/events');

module.exports = class LogReporter {
  constructor() {
    this._logs = {};
  }
  handleEvent(event, data) {
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
  getLog(filter) {
    const keys = Object.keys(this._logs);
    if (keys.length === 0) {
      return [];
    } else if (keys.length === 1) {
      const log = this._logs[keys[0]];
      return applyFilter(log, filter);
    } else {
      return keys.reduce((res, key) => {
        res[key] = applyFilter(this._logs[key], filter);
        return res;
      }, {});
    }
  }
  _push(env, str) {
    this._logs[env.id] = this._logs[env.id] || [];
    this._logs[env.id].push(str);
  }
};

function applyFilter(log, filter) {
  if (!filter || !filter.length) {
    return log;
  } else {
    return log.filter(line => isLineMatches(line, filter));
  }
}

function isLineMatches(line, filter) {
  return filter.some(str => line.startsWith(str));
}
