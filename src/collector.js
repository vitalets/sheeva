/**
 * Collects events from several sessions
 */

const events = require('./events');

module.exports = class Collector {
  constructor() {
    this.suites = new Map();
    this.log = [];
  }
  update(event, data) {
    const errMessage = data && data.error ? ` ${data.error.message}` : '';
    const suiteName = data && data.suite && data.suite.parent ? data.suite.name : 'root';
    switch (event) {
      case events.SUITE_START:
        this.log.push(`${event} ${suiteName}`);
        break;
      case events.SUITE_END:
        this.log.push(`${event} ${suiteName}${errMessage}`);
        break;
      case events.HOOK_START:
        this.log.push(`${event} ${suiteName} ${data.type} ${data.index}`);
        break;
      case events.HOOK_END:
        this.log.push(`${event} ${suiteName} ${data.type} ${data.index}${errMessage}`);
        break;
      case events.TEST_START:
        this.log.push(`${event} ${data.test.name}`);
        break;
      case events.TEST_END:
        this.log.push(`${event} ${data.test.name}${errMessage}`);
        break;
    }
    if (data && data.error) {
      console.log(data.error.message);
    }
  }
};
