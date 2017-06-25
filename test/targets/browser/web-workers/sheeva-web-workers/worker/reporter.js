
'use strict';

const {RUNNER_EVENT} = require('../events');

const PASS_EVENTS = {
  TEST_START: true,
  TEST_END: true,
  TEST_RETRY: true,
  //HOOK_START: true,
  HOOK_END: true,
  SUITE_START: true,
  SUITE_END: true,
};

module.exports = class WorkerReporter {
  handleEvent(event, data) {
    if (PASS_EVENTS.hasOwnProperty(event)) {
      data = clean(data);
      self.postMessage({type: RUNNER_EVENT, data: {event, data}});
    }
  }
};

function clean(data) {
  delete data.session;
  delete data.target;
}
