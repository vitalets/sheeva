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

    if (INCLUDE_EVENTS.indexOf(event) >= 0) {
      const session = data.session ? ` session #${data.session.index}` : '';
      const name = this._getName(data);
      console.log(`${event}${session}${name}`);
    }

    if (data.error) {
      const error = event === events.TEST_END ? data.error.message : data.error;
      console.error(error);
    }
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
