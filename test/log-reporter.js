/**
 * Reporter that just put events into log
 */

const events = require('../src/events');

module.exports = class LogReporter {
  constructor() {
    /*
      env1: {
        session1: [
          SESSION_START,
          SUITE_START,
          ...
        ],
        session2: [
          SESSION_START,
          SUITE_START,
          ...
        ],
      },
      env2: {
        ...
      }
    */
    this._logs = {};
  }
  handleEvent(event, data) {
    const log = this._getLog(data);
    //console.log('log-reporter:', event)
    //console.log('log-reporter:', new Date(data.timestamp), event)
    //console.log('\nlog-reporter:', new Date(data.timestamp), event, data.test && data.test.name, '\n')
    //console.log('log-reporter:', event, data.error)
    const errMessage = data && data.error ? ` ${data.error.message}` : '';
    const suiteName = data && data.suite && data.suite.parent ? data.suite.name : 'root';
    switch (event) {

      // case events.RUNNER_START: {
      //   this._push(env, `${event} ${data.session.index}`);
      //   break;
      // }
      // case events.RUNNER_END: {
      //   this._push(env, `${event} ${data.session.index}`);
      //   break;
      // }

      case events.SESSION_START: {
        log.push(`${event} ${data.session.index}`);
        break;
      }
      case events.SESSION_END: {
        log.push(`${event} ${data.session.index}`);
        break;
      }
      case events.SUITE_START: {
        log.push(`${event} ${suiteName}`);
        break;
      }
      case events.SUITE_END: {
        log.push(`${event} ${suiteName}${errMessage}`);
        break;
      }
      case events.HOOK_START: {
        log.push(`${event} ${suiteName} ${data.hookType} ${data.index}`);
        break;
      }
      case events.HOOK_END: {
        log.push(`${event} ${suiteName} ${data.hookType} ${data.index}${errMessage}`);
        break;
      }
      case events.TEST_START: {
        log.push(`${event} ${data.test.name}`);
        break;
      }
      case events.TEST_END: {
        log.push(`${event} ${data.test.name}${errMessage}`);
        break;
      }
    }
  }
  getResult(filter) {
    if (!filter.include && !filter.exclude) {
      // default filter
      filter.exclude = ['HOOK_START', 'TEST_START'];
    }
    return processSingleKey(this._logs, envData => {
      return processSingleKey(envData, log => applyFilter(log, filter))
    });
  }
  _getLog({env, session}) {
    if (!env || !session) {
      return [];
    }
    this._logs[env.id] = this._logs[env.id] || {};
    const sessionName = `session${session.index}`;
    this._logs[env.id][sessionName] = this._logs[env.id][sessionName] || [];
    return this._logs[env.id][sessionName];
  }
};

/**
 * If object contains 1 key, return it's value processed by fn
 * Otherwise process all props with fn and return original obj
 */
function processSingleKey(obj, fn) {
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    return fn(obj[keys[0]]);
  } else {
    keys.forEach(key => obj[key] = fn(obj[key]));
    return obj;
  }
}

function applyFilter(log, filter) {
  if (filter.include) {
    log = log.filter(line => {
      return filter.include.some(str => line.startsWith(str));
    });
  }
  if (filter.exclude) {
    log = log.filter(line => {
      return filter.exclude.every(str => !line.startsWith(str));
    });
  }
  return log;
}
