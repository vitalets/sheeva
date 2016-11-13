/**
 * Reporter that just put events into log
 */

// const status = require('node-status');
const events = require('../events');

module.exports = class ConsoleReporter {
  constructor() {

  }
  onEvent(event, data) {
    // console.log('console-reporter:', event, data.error)
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
      case events.ENV_START: {
        console.log(`${data.label} queues: ${data.queues.length}`);
        break;
      }
      case events.ENV_END: {
        console.log(event, data.env);
        break;
      }
      case events.SESSION_START: {
        // console.log(event);
        break;
      }
      case events.SESSION_END: {
        // console.log(event);
        break;
      }
      case events.SUITE_START: {
        // console.log(event);
        break;
      }
      case events.SUITE_END: {
        // console.log(event);
        break;
      }
      case events.TEST_END: {
        if (data && data.error) {
          console.log(`Env:`,data.env);
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
