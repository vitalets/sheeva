/**
 * Reporter that just put events into log
 */

const events = require('../events');

module.exports = class ConsoleReporter {
  constructor() {
    this.totalFiles = 0;
    this.executedFiles = 0;
  }
  onEvent(event, data) {
    switch (event) {
      case events.START:
        this.totalFiles = data.files.length;
        console.log(`Running ${data.files.length} file(s) on ${data.envs.length} env(s)...`);
        break;
      case events.END:
        console.log(`End.`);
        break;
    }
    processError(data);
  }
  onSessionEvent(event, data) {
    switch (event) {
      case events.TEST_END:
        if (data && data.error) {
          console.log(`FAILED: ${data.test.name}`);
          processError(data);
        } else {
          console.log(`PASSED: ${data.test.name}`)
        }
        return;
        break;
    }
    processError(data);
  }
};

function processError(data) {
  if (data && data.error) {
    console.log(data.error.message);
  }
}
