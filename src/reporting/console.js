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
    // switch (event) {
    //   case events.SUITE_START:
    //     this.log.push(`${event} ${suiteName}`);
    //     break;
    //   case events.SUITE_END:
    //     this.log.push(`${event} ${suiteName}${errMessage}`);
    //     break;
    //   case events.HOOK_START:
    //     this.log.push(`${event} ${suiteName} ${data.type} ${data.index}`);
    //     break;
    //   case events.HOOK_END:
    //     this.log.push(`${event} ${suiteName} ${data.type} ${data.index}${errMessage}`);
    //     break;
    //   case events.TEST_START:
    //     this.log.push(`${event} ${data.test.name}`);
    //     break;
    //   case events.TEST_END:
    //     this.log.push(`${event} ${data.test.name}${errMessage}`);
    //     break;
    // }
    processError(data);
  }
};

function processError(data) {
  if (data && data.error) {
    console.log(data.error.message);
  }
}
