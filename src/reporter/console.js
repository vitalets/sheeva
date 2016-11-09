/**
 * Reporter that just put events into log
 */

// const status = require('node-status');
const events = require('../events');

module.exports = class ConsoleReporter {
  constructor() {

  }
  onEvent(event, data) {
    switch (event) {
      case events.START: {
        const {files, config, envSuites} = data;
        console.log(`Processed ${files.length} file(s).`);
        console.log(`Running on ${envSuites.size} env(s) with concurrency = ${config.concurrency}.`);
        break;
      }
      case events.END: {
        console.log(`End.`);
        break;
      }
      case events.SUITE_START: {
        break;
      }
      case events.SUITE_END: {
        break;
      }
      case events.TEST_END: {
        if (data && data.error) {
          console.log(`FAIL:\n${formatTestError(data)}`);
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
  const error = data && data.error;
  if (error) {
    console.log(error.name === 'UnexpectedError' ? error.message : error);
  }
}

function formatTestError(data) {
  return []
    .concat(data.test.parents.map(suite => suite.name))
    .concat([data.test.name])
    .map((item, i) => ' '.repeat(i * 2) + item)
    .join('\n');
}
