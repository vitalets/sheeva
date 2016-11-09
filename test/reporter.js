/**
 * Reporter that just put events into log
 */

const events = require('../src/events');

module.exports = class LogReporter {
  constructor() {
    this.log = [];
  }
  onEvent(event, data) {
    const errMessage = data && data.error ? ` ${data.error.message}` : '';
    const suiteName = data && data.suite && data.suite.parent ? data.suite.name : 'root';
    switch (event) {
      case events.SUITE_START: {
        this.log.push(`${event} ${suiteName}`);
        break;
      }
      case events.SUITE_END: {
        this.log.push(`${event} ${suiteName}${errMessage}`);
        break;
      }
      case events.HOOK_START: {
        // this.log.push(`${event} ${suiteName} ${data.type} ${data.index}`);
        break;
      }
      case events.HOOK_END: {
        this.log.push(`${event} ${suiteName} ${data.type} ${data.index}${errMessage}`);
        break;
      }
      case events.TEST_START: {
        // this.log.push(`${event} ${data.test.name}`);
        break;
      }
      case events.TEST_END: {
        this.log.push(`${event} ${data.test.name}${errMessage}`);
        break;
      }
    }
  }
};
