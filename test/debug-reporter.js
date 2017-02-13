/**
 * Reporter that just logs events to console (for debug)
 */

const events = require('../src/events');

module.exports = class DebugReporter {
  handleEvent(event, data) {
    const env = data.env;
    const session = data.session ? `Session #${data.session.index}` : '';
    //console.log('log-reporter:', event)
    //console.log('log-reporter:', new Date(data.timestamp), event)
    //console.log('\nlog-reporter:', new Date(data.timestamp), event, data.test && data.test.name, '\n')
    //log('log-reporter:', event, data.error)
    //const errMessage = data && data.error ? ` ${data.error.message}` : '';
    const errMessage = data && data.error ? ` err` : '';
    const suiteName = data && data.suite && data.suite.parent ? data.suite.name : 'root';
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
        log(`${event} ${session} ${suiteName}`);
        break;
      }
      case events.SUITE_END: {
        log(`${event} ${session} ${suiteName}${errMessage}`);
        break;
      }
      case events.SUITE_SPLIT: {
        log(`${event} ${session} ${suiteName}${errMessage}`);
        break;
      }
      case events.HOOK_START: {
        // log(`${event} ${suiteName} ${data.hookType} ${data.index}`);
        break;
      }
      case events.HOOK_END: {
        log(`${event} ${session} ${suiteName} ${data.hookType} ${data.index}${errMessage}`);
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
  }
};

function log() {
  console.log.apply(console, arguments);
}
