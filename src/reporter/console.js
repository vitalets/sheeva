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
      case events.START: {
        const {files, envs, config} = data;
        this.totalFiles = files.length;
        console.log(`Running ${files.length} file(s) on ${envs.length} env(s) with concurrency = ${config.concurrency}`);
        break;
      }
      case events.END: {
        console.log(`End.`);
        break;
      }
    }
    processError(data);
  }
  onSessionEvent(event, data) {
    switch (event) {
      case events.TEST_END: {
        if (data && data.error) {
          const msg = ['FAIL:']
            .concat(data.test.parents.map(suite => suite.name))
            .concat([data.test.name])
            .map((item, i) => ' '.repeat(i * 2) + item)
            .join('\n');
          console.log(msg);
          processError(data);
        } else {
          console.log(`PASS: ${data.test.name}`)
        }
        return;
      }
    }
    processError(data);
  }
};

function processError(data) {
  if (data && data.error) {
    console.log(data.error.message);
  }
}
