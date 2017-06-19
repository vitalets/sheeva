/**
 * Reporter for sub-sheeva
 */

'use strict';

/* eslint-disable complexity */
const events = require('../../../src/events');

module.exports = class LogReporter {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} [options.include]
   * @param {Array} [options.exclude]
   */
  constructor(options = {}) {
    this._options = options;
    this._rawLog = [];
    this._flatLog = [];
    this._treeLog = {};
  }

  handleEvent(event, data) {
    this._rawLog.push({event, data});
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
      case events.EXECUTER_START: {
        this._add(data, `${event}`);
        break;
      }
      case events.EXECUTER_END: {
        this._add(data, `${event}${errMessage}`);
        break;
      }
      case events.TARGET_START: {
        this._add(data, `${event} ${data.target.id}`);
        break;
      }
      case events.TARGET_END: {
        this._add(data, `${event} ${data.target.id}`);
        break;
      }
      case events.WORKER_ADD: {
        this._add(data, `${event} ${data.worker.index}`);
        break;
      }
      case events.WORKER_DELETE: {
        this._add(data, `${event} ${data.worker.index}`);
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

  getRawLog() {
    return this._rawLog.filter(item => this._isPassingFilter(item.event));
  }

  getFlatLog() {
    return this._flatLog.filter(eventName => this._isPassingFilter(eventName));
  }

  getTreeLog() {
    const treeLog = this._treeLog;
    Object.keys(treeLog).forEach(targetId => {
      Object.keys(treeLog[targetId]).forEach(sessionName => {
        treeLog[targetId][sessionName] = treeLog[targetId][sessionName]
          .filter(eventName => this._isPassingFilter(eventName));
      });
    });
    return treeLog;
  }

  _add({session}, str) {
    this._flatLog.push(str);
    if (session) {
      const target = session.target;
      this._treeLog[target.id] = this._treeLog[target.id] || {};
      const sessionName = `session${session.index}`;
      this._treeLog[target.id][sessionName] = this._treeLog[target.id][sessionName] || [];
      this._treeLog[target.id][sessionName].push(str);
    }
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
};
