/**
 * Reporter that just put events into log
 */

const events = require('../../src/events');

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
    this._events = [];
  }
  handleEvent(event, data) {
    //console.log('\n\n\n\n\nlog-reporter:', event)
    //console.log('log-reporter:', new Date(data.timestamp), event)
    //console.log('\nlog-reporter:', new Date(data.timestamp), event, data.test && data.test.name, '\n')
    //console.log('log-reporter:', event, data.error)
    this._events.push({event, data});
    const errMessage = data && data.error ? ` ${data.error.message}` : '';
    const suiteName = data && data.suite && data.suite.parent ? data.suite.name : 'root';
    switch (event) {
      case events.RUNNER_INIT: {
        this._add(data, `${event}`);
        break;
      }
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
      case events.QUEUE_SPLIT: {
        this._add(data, `${event} ${data.splittedQueue.tests.length} of ${data.remainingTestsCount}`);
        break;
      }
      case events.SUITE_END: {
        this._add(data, `${event} ${suiteName}${errMessage}`);
        break;
      }
      case events.HOOK_START: {
        this._add(data, `${event} ${suiteName} ${data.hook.index ? data.hook.name : data.hook.type}`);
        break;
      }
      case events.HOOK_END: {
        this._add(data, `${event} ${suiteName} ${data.hook.index ? data.hook.name : data.hook.type}${errMessage}`);
        break;
      }
      case events.TEST_START: {
        this._add(data, `${event} ${data.test.name}`);
        break;
      }
      case events.TEST_RETRY: {
        this._add(data, `${event} ${data.test.name}${errMessage}`);
        break;
      }
      case events.TEST_END: {
        this._add(data, `${event} ${data.test.name}${errMessage}`);
        break;
      }
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

  /**
   *
   * @param {Object} filter
   * @param {Array} [filter.include]
   * @param {Array} [filter.exclude]
   * @param {Boolean} [filter.flat]
   */
  getResult(filter = {}) {
    this._setDefaultForEmptyFilter(filter);

    const loggedEnvs = Object.keys(this._treeLog);
    const flat = filter.flat || loggedEnvs.length === 0 || this._isSingleEnvAndSession();

    if (filter.raw) {
      return this._events
        .filter(item => isPassingFilter(item.event, filter));
    }

    if (flat) {
      return this._flatLog
        .filter(eventName => isPassingFilter(eventName, filter));
    } else {
      return this._applyFilterToTreeLog(filter);
    }
  }

  _applyFilterToTreeLog(filter) {
    const treeLog = this._treeLog;
    this._treeLog = {};
    Object.keys(treeLog).forEach(envId => {
      Object.keys(treeLog[envId]).forEach(sessionName => {
        treeLog[envId][sessionName] = treeLog[envId][sessionName]
          .filter(eventName => isPassingFilter(eventName, filter));
      })
    });
    return treeLog;
  }

  _isSingleEnvAndSession() {
    const loggedEnvs = Object.keys(this._treeLog);
    return (loggedEnvs.length === 1 && Object.keys(this._treeLog[loggedEnvs[0]]).length <= 1);
  }

  _setDefaultForEmptyFilter(filter) {
    if (!filter.include && !filter.exclude) {
      filter.include = ['TEST_END'];
    }
  }
};

function isPassingFilter(eventName, filter) {
  let result = true;
  if (filter.exclude) {
    result = filter.exclude.every(str => !eventName.startsWith(str));
  }
  if (filter.include) {
    result = filter.include.some(str => eventName.startsWith(str));
  }
  return result;
}
