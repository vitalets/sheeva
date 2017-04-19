/**
 * Collects runner times
 */

/* eslint-disable complexity, max-statements */

const {result} = require('../../result');
const {
  RUNNER_INIT,
  RUNNER_START,
  RUNNER_END,
} = require('../../events');

module.exports = class RunnerTimesCollector {
  constructor() {
    this._runnerTimes = result.runnerTimes;
  }

  handleEvent(event, data) {
    switch (event) {
      case RUNNER_INIT: {
        this._runnerTimes.init = data.timestamp;
        break;
      }
      case RUNNER_START: {
        this._runnerTimes.start = data.timestamp;
        break;
      }
      case RUNNER_END: {
        this._runnerTimes.end = data.timestamp;
        break;
      }
    }
  }
};
