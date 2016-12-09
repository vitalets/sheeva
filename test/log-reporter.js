/**
 * Reporter that just put events into log
 */

const events = require('../src/events');

module.exports = class LogReporter {
  constructor() {
    /*
      treeLog:

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
    this._flatLog = [];
    this._treeLog = {};
  }
  handleEvent(event, data) {
    //console.log('\n\n\n\n\nlog-reporter:', event)
    //console.log('log-reporter:', new Date(data.timestamp), event)
    //console.log('\nlog-reporter:', new Date(data.timestamp), event, data.test && data.test.name, '\n')
    //console.log('log-reporter:', event, data.error)
    const errMessage = data && data.error ? ` ${data.error.message}` : '';
    const suiteName = data && data.suite && data.suite.parent ? data.suite.name : 'root';
    switch (event) {
      case events.RUNNER_START: {
        this._add(data, `${event}`);
        break;
      }
      case events.RUNNER_END: {
        this._add(data, `${event}${errMessage}`);
        break;
      }

      case events.ENV_START: {
        this._add(data, `${event} ${data.env.id}`);
        break;
      }
      case events.ENV_END: {
        this._add(data, `${event} ${data.env.id}`);
        break;
      }

      case events.SESSION_START: {
        this._add(data, `${event} ${data.session.index}`);
        break;
      }
      case events.SESSION_END: {
        this._add(data, `${event} ${data.session.index}`);
        break;
      }
      case events.SUITE_START: {
        this._add(data, `${event} ${suiteName}`);
        break;
      }
      case events.SUITE_END: {
        this._add(data, `${event} ${suiteName}${errMessage}`);
        break;
      }
      case events.HOOK_START: {
        this._add(data, `${event} ${suiteName} ${data.hookType} ${data.index}`);
        break;
      }
      case events.HOOK_END: {
        this._add(data, `${event} ${suiteName} ${data.hookType} ${data.index}${errMessage}`);
        break;
      }
      case events.TEST_START: {
        this._add(data, `${event} ${data.test.name}`);
        break;
      }
      case events.TEST_END: {
        this._add(data, `${event} ${data.test.name}${errMessage}`);
        break;
      }
    }
  }

  /**
   *
   * @param {Object} filter
   * @param {Array} [filter.include]
   * @param {Array} [filter.exclude]
   * @param {Boolean} [filter.flat]
   */
  getResult(filter) {
    if (!filter.include && !filter.exclude) {
      // default filter
      filter.exclude = ['RUNNER_', 'ENV_', 'HOOK_START', 'TEST_START'];
    }

    const envs = Object.keys(this._treeLog);
    const flat = envs.length === 0 || (envs.length === 1 && Object.keys(this._treeLog[envs[0]]).length <= 1);

    if (flat) {
      return applyFilter(this._flatLog, filter);
    } else {
      Object.keys(this._treeLog).forEach(envId => {
        Object.keys(this._treeLog[envId]).forEach(sessionName => {
          this._treeLog[envId][sessionName] = applyFilter(this._treeLog[envId][sessionName], filter);
        })
      });
      return this._treeLog;
    }
  }
  _add({session}, str) {
    this._flatLog.push(str);
    if (session) {
      const env = session.env;
      this._treeLog[env.id] = this._treeLog[env.id] || {};
      const sessionName = `session${session.index}`;
      this._treeLog[env.id][sessionName] = this._treeLog[env.id][sessionName] || [];
      this._treeLog[env.id][sessionName].push(str);
    }
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
