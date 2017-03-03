/**
 * Reporter that just put events into log
 *
 */

/* eslint-disable complexity */

const events = require('../../src/events');

const DEFAULT_INCLUDE = ['TEST_END'];

module.exports = class LogReporter {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} [options.include]
   * @param {Array} [options.exclude]
   * @param {Boolean} [options.flat]
   * @param {Boolean} [options.raw]
   */
  constructor(options) {
    this._options = {};
    this._flatLog = [];
    this._treeLog = {};
    this._events = [];
    this._setOptions(options);
  }

  handleEvent(event, data) { // eslint-disable-line complexity
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
      case events.SLOT_ADD: {
        this._add(data, `${event} ${data.slot.index}`);
        break;
      }
      case events.SLOT_DELETE: {
        this._add(data, `${event} ${data.slot.index}`);
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

  getResult() {
    const loggedEnvs = Object.keys(this._treeLog);
    const flat = this._options.flat || loggedEnvs.length === 0 || this._isSingleEnvAndSession();

    if (this._options.raw) {
      return this._getRawLog();
    } else if (flat) {
      return this._getFlatLog();
    } else {
      return this._getTreeLog();
    }
  }

  _getRawLog() {
    return this._events
      .filter(item => this._isPassingFilter(item.event));
  }

  _getFlatLog() {
    return this._flatLog
      .filter(eventName => this._isPassingFilter(eventName));
  }

  _getTreeLog() {
    const treeLog = this._treeLog;
    this._treeLog = {};
    Object.keys(treeLog).forEach(envId => {
      Object.keys(treeLog[envId]).forEach(sessionName => {
        treeLog[envId][sessionName] = treeLog[envId][sessionName]
          .filter(eventName => this._isPassingFilter(eventName));
      })
    });
    return treeLog;
  }

  _isPassingFilter(eventName) {
    let result = true;
    const {include, exclude} = this._options;
    if (exclude) {
      result = exclude.every(str => !eventName.startsWith(str));
    }
    if (include) {
      result = include.some(str => eventName.startsWith(str));
    }
    return result;
  }

  _isSingleEnvAndSession() {
    const loggedEnvs = Object.keys(this._treeLog);
    return (loggedEnvs.length === 1 && Object.keys(this._treeLog[loggedEnvs[0]]).length <= 1);
  }

  _setOptions(options) {
    if (!options.include && !options.exclude) {
      options.include = DEFAULT_INCLUDE;
    }
    this._options = options;
  }
};
