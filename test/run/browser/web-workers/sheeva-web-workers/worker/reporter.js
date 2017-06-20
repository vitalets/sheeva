
'use strict';

const {EVENT} = require('../events');

module.exports = class WorkerReporter {
  handleEvent(event/*, data*/) {
    self.postMessage({type: EVENT, data: {event}});
    // self.postMessage({type: EVENT, event, data});
  }
};
