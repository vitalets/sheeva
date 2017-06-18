'use strict';

/**
 * Reporter that just logs events to console (for debug)
 */

/* eslint-disable no-console */

const events = require('../../src/events');
const INCLUDE_EVENTS = new Set([
  events.RUNNER_START,
  events.RUNNER_STARTED,
  events.RUNNER_END,
  events.EXECUTER_START,
  events.EXECUTER_END,
  events.WORKER_ADD,
  events.WORKER_DELETE,
  events.SESSION_START,
  events.SESSION_END,
  events.SUITE_START,
  events.SUITE_END,
  //events.QUEUE_SPLIT,
  //events.HOOK_START,
  //events.HOOK_END,
  events.TEST_START,
  events.TEST_END,
]);

module.exports = class DebugReporter {
  handleEvent(event, data = {}) {
    if (INCLUDE_EVENTS.has(event)) {
      this._printEvent(event, data);
    }

    if (data.error) {
      this._printError(event, data);
    }
  }

  _printEvent(event, data) {
    if (event === events.RUNNER_STARTED) {
      const {config, matchedFiles, runner} = data.state;
      console.log(
        `${event} targets: ${config.targets.length}, files: ${matchedFiles.size}, tests: ${runner.tests.total}`
      );
      return;
    }
    const session = data.session ? ` session #${data.session.index}` : '';
    const worker = data.worker ? ` worker #${data.worker.index}` : '';
    const name = this._getName(data);
    console.log(`${event}${worker}${session}${name}`);
  }

  _printError(event, data) {
    const error = event === events.TEST_END ? data.error.message : data.error;
    console.error(error);
  }

  _getName(data) {
    if (data.suite) {
      return ' ' + data.suite.name;
    } else if (data.test) {
      return ' ' + data.test.name;
    } else if (data.hook) {
      return ' ' + data.hook.name;
    } else {
      return '';
    }
  }
};
