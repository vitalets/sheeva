/**
 * Reporter that just logs events to console (for debug)
 */

const events = require('../src/events');
const INCLUDE_EVENTS = [
  events.RUNNER_START,
  events.RUNNER_END,
  events.SESSION_START,
  events.SESSION_END,
  //events.SUITE_START,
  //events.SUITE_END,
  //events.QUEUE_SPLIT,
  //events.HOOK_START,
  //events.HOOK_END,
  //events.TEST_START,
  events.TEST_END,
];

module.exports = class DebugReporter {
  handleEvent(event, data) {
    data = data || {};

    const session = data.session ? ` session #${data.session.index}` : '';
    const name = this._getName(data);
    console.log(`${event}${session}${name}`);
    if (data.error) {
      console.error(event === events.TEST_END ? data.error.message : data.error);
    }

    /*
    switch (event) {
      case events.RUNNER_START: {
        log(`${event}`);
        break;
      }
      case events.RUNNER_END: {
        log(`${event}`, data.error);
        break;
      }

      case events.SESSION_START: {
        log(`${event} ${session}`);
        break;
      }
      case events.SESSION_END: {
        log(`${event} ${session}`);
        break;
      }

      case events.SUITE_START: {
        //log(`${event} ${session} ${suiteName}`);
        break;
      }
      case events.SUITE_END: {
        //log(`${event} ${session} ${suiteName}${errMessage}`);
        break;
      }
      case events.QUEUE_SPLIT: {
        //log(`${event} ${session} ${suiteName}${errMessage}`);
        break;
      }
      case events.HOOK_START: {
        // log(`${event} ${suiteName} ${data.hookType} ${data.index}`);
        break;
      }
      case events.HOOK_END: {
        // log(`${event} ${session} ${suiteName} ${data.hookType} ${data.index}${errMessage}`);
        break;
      }
      case events.TEST_START: {
        // log(`${event} ${data.test.name}`);
        break;
      }
      case events.TEST_END: {
        log(`${event} ${session} ${data.test.name}${errMessage}`);
        break;
      }
    }
    */
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
