
'use strict';

const {RUNNER_EVENT} = require('../messages');

const PASS_EVENTS = {
  RUNNER_STARTED: true,
  EXECUTER_END: true,
  RUNNER_END: true,
  SUITE_START: true,
  SUITE_END: true,
  HOOK_START: true,
  HOOK_END: true,
  TEST_START: true,
  TEST_END: true,
  TEST_RETRY: true,
  EXTRA_ERROR: true,
};

module.exports = class WorkerReporter {
  handleEvent(event, data) {
    if (PASS_EVENTS.hasOwnProperty(event)) {
      clean(data);
      self.postMessage({messageType: RUNNER_EVENT, messageData: {event, data}});
    }
  }
};

function clean(data) {
  delete data.session;
  delete data.target;
  delete data.state;
  if (data.error) {
    serializeError(data);
  }
}

function serializeError(data) {
  const {name, message, stack} = data.error;
  data.error = {name, message, stack};
}
